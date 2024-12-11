import { useState } from 'react';
import { Box, Button, Text } from '@chakra-ui/react';

import useMutation from '../hooks/useMutation';

const fileTypes = ['image/png', 'image/jpeg', 'image/jpg'];
const URL = '/images'

const ErrorText = ({ children, ...props }) => {
  <Text fontSize="lg" color="red.500" {...props}>
    {children}
  </Text>
}

const Posts = () => {
  const [error, setError] = useState('')
  const [refetch, setRefetch] = useState(0)
  
  const { error: uploadError, isLoading: uploading, mutate: uploadImage } = useMutation({ url: URL })
  const { data: imageUrls = [], isLoading: imagesLoading, error: fetchError } = useQuery(URL, refetch)

  const handleUpload = async (e) => {
    const file = e.target.files[0];

    if (fileTypes.includes(file.type)) {
      const formData = new FormData();

      formData.append('image', file);
    } else {
      setError('Please select an image file (png, jpeg, jpg)')
    }

    await uploadImage(formData)

    // WE NEED TO WAIT WHILE THE image IS UPLOADED AND READY TO BE ACCESSED
    setTimeout(() => {
      setRefetch(prev => prev + 1)
    }, 1000)
  }

  return (
    <Box mt={6}>
      <input type="file" id='imageInput' hidden onChange={handleUpload} />

      <Button as="label" htmlFor="imageInput" colorScheme="blue" variant="outline" mb={4} cursor="pointer" isLoading={uploading}>
        Upload
      </Button>

      {error && (
        <ErrorText>
          {error}
        </ErrorText>
      )}

      {uploadError && (
        <ErrorText>
          {uploadError}
        </ErrorText>
      )}

      <Text textAlign="left" mb={4}>
        Posts
      </Text>

      {imagesLoading && (
        <CircularProgress isIndeterminate color="gray.600" trackColor="blue.300" size={7} thickness={10} />
      )}

      {fetchError && (
        <ErrorText textAlign="left">
          Failed to load images
        </ErrorText>
      )}

      {!fetchError && imageUrls.length === 0 && (
        <ErrorText textAlign="left">
          No images found
        </ErrorText>
      )}  

      <SimpleGrid columns={[1, 2, 3]} spacing={4}>
        {imageUrls?.length > 0 && imageUrls.map((url) => (
          <Image key={url} src={url} alt="Uploaded image" borderRadius={5} />
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default Posts;
