import { createContext } from "react";

const Context = createContext(null as any);

type Props = {
  children: React.ReactNode;
};

const Provider = ({ children }: Props) => {
  return <Context.Provider value={{}}>{children}</Context.Provider>;
};
