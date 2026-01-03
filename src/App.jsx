import { useState } from "react";
import { MyDocument } from "./pdf-template";
import { pdf } from "@react-pdf/renderer";

import { useTagStore } from "./store";
import JsBarcode from "jsbarcode";

import {
  BarcodeDetector,
  ZXING_WASM_VERSION,
  prepareZXingModule,
} from "barcode-detector/ponyfill";

prepareZXingModule({
  overrides: {
    locateFile: (path, prefix) => {
      if (path.endsWith(".wasm")) {
        return `https://unpkg.com/zxing-wasm@${ZXING_WASM_VERSION}/dist/reader/${path}`;
      }
      return prefix + path;
    },
  },
});

const barcodeDetector = new BarcodeDetector({
  formats: ["upc_a", "ean_13", "code_128"],
});

export default function App() {
  const productList = useTagStore(
    (state) => state.productList
  );
  const { addProduct, removeProduct, deleteList } = useTagStore(
    (state) => state
  );

  const { madeBy, setMadeBy, supervisedBy, setSupervisedBy } = useTagStore(
    (state) => state
  );

  const [form, setForm] = useState({
    descripcion: "",
    codigo: "",
    hechoPor: madeBy,
    superviso: supervisedBy,
    piezas: "",
    barcodeImg: null,
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const agregarItem = () => {
    if (!form.descripcion || !form.codigo) return;

    addProduct({ ...form, id: Date.now() });

    setForm({
      descripcion: "",
      codigo: "",
      hechoPor: madeBy,
      superviso: supervisedBy,
      piezas: "",
      barcodeImg: null,
    });
  };

  function generarBarcodeBlob(valor) {
    return new Promise((resolve, format) => {
      const canvas = document.createElement("canvas");

      JsBarcode(canvas, valor, {
        format: "CODE128",
        width: 2,
        height: 40,
        displayValue: false,
      });

      canvas.toBlob((blob) => {
        resolve(blob);
      }, "image/png");
    });
  }

  async function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    barcodeDetector.detect(file).then(async (barcodes) => {
      console.log(barcodes);

      if (barcodes.length === 0) {
        return setForm({
          ...form,
          codigo: "000000000000",
        });
      }

      const barcodeValue = barcodes[0].rawValue;
      const barcodeCleaned =
        String(barcodeValue)[0] === "0"
          ? String(barcodeValue).slice(1)
          : String(barcodeValue);

      const realFormat = barcodeCleaned.length === 12 ? "upc_a" : "ean_13";

      const barcodeImgBlob = await generarBarcodeBlob(
        String(barcodeCleaned),
        realFormat
      );

      const base64Barcode = await blobToBase64(barcodeImgBlob);
      console.log(base64Barcode);

      setForm({
        ...form,
        codigo: barcodeCleaned,
        barcodeImg: base64Barcode,
      });
    });
  };

  const generarPDF = async (items) => {
    const blob = await pdf(<MyDocument items={items} />).toBlob();

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "documento.pdf";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h2>Registro</h2>

      {/* FORMULARIO */}
      <div style={{ marginBottom: 20 }}>
        <input
          name="descripcion"
          placeholder="Descripción"
          value={form.descripcion}
          onChange={handleChange}
        />
        <br />

        <input
          name="codigo"
          type="number"
          placeholder="Código numérico"
          value={form.codigo}
          onChange={handleChange}
        />

        <br />

        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhoto}
        />
        <br />

        <input
          name="hechoPor"
          placeholder="Hecho por"
          value={madeBy}
          onChange={(e) => {
            handleChange(e);
            setMadeBy(e.target.value);
          }}
        />
        <br />

        <input
          name="superviso"
          placeholder="Supervisó"
          value={supervisedBy}
          onChange={(e) => {
            handleChange(e);
            setSupervisedBy(e.target.value);
          }}
        />
        <br />

        <input
          name="piezas"
          type="number"
          placeholder="Piezas"
          value={form.piezas}
          onChange={handleChange}
        />
        <br />
        <br />

        <button onClick={agregarItem}>Agregar</button>
      </div>

      {/* LISTA */}
      <h3>Lista - Marbetes: {productList.length}</h3>

      {productList.length === 0 && <p>No hay registros</p>}

      {productList.map((item) => (
        <div
          key={item.id}
          style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}
        >
          <p>
            <b>Descripción:</b> {item.descripcion}
          </p>
          <p>
            <b>Código:</b> {item.codigo}
          </p>
          <p>
            <b>Hecho por:</b> {item.hechoPor}
          </p>
          <p>
            <b>Supervisó:</b> {item.superviso}
          </p>
          <p>
            <b>Piezas:</b> {item.piezas}
          </p>

          <button onClick={() => removeProduct(item.id)}>Eliminar</button>
        </div>
      ))}

      {/* ACCIONES */}
      {productList.length > 0 && (
        <>
          <button onClick={deleteList}>Borrar lista</button>{" "}
          <button onClick={async () => generarPDF(productList)}>
            Imprimir
          </button>
        </>
      )}
    </div>
  );
}
