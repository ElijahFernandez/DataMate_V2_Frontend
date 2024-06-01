import { createContext, useState } from "react";



export type SnackbarContextType = {
  message: string | null,
  handleSetMessage: (text: string | null) => void,
}

export const SnackbarContext = createContext<SnackbarContextType | null>(null);

const SnackbarContextProvider = (props: { children: React.ReactNode }) => {
  const [message, setMessage] = useState<string | null>(null);

  const handleSetMessage = (text: string | null) => {
    setMessage(text);
  }

  const value = {
    message,
    handleSetMessage,
  }

  return (
    <SnackbarContext.Provider value={value}>
      {props.children}
    </SnackbarContext.Provider>
  )

}

export default SnackbarContextProvider;