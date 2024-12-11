import { useState } from "react"
import { useToast } from "@chakra-ui/react"

import axiosClient from "../config/axios"

const useMutation = ({ url, method = 'POST' }) => {
  const toast = useToast()

  const [state, setState] = useState({
    isLoading: false,
    error: null
  })

  // data IS THE formData
  const fn = async data => {
    setState(prev => ({
      ...prev,
      isLoading: true
    }))

    axiosClient({ url, method, data })
      .then(() => {
        setState({ isLoading: false, error: null })
        toast({
          title: 'Success',
          status: 'success',
          duration: 3000,
          position: 'top',
          isClosable: true
        })
      })
      .catch(error => {
        setState({ isLoading: false, error: error.message })
      })
  }

  return { ...state, mutate: fn }
}

export default useMutation