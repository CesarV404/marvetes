import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useTagStore = create()(
  persist(
    (set) => ({
      productList: [],
      madeBy: "",
      supervisedBy: "",
      addProduct: (newProduct) =>
        set((state) => ({ productList: [...state.productList, newProduct] })),
      removeProduct: (id) =>
        set((state) => {
          const removedItem = state.productList.filter(
            (item) => item.id !== id
          );
          return { productList: removedItem };
        }),
      deleteList: () => set({ productList: [] }),
      setMadeBy: (name) => set({ madeBy: name }),
      setSupervisedBy: (name) => set({ supervisedBy: name }),
    }),
    {
      name: "product-list-storage", // name of the item in the storage (must be unique)
    }
  )
);
