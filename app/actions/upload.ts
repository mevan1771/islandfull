export async function uploadToCloudinary(formData: FormData) {
  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { success: false, error: errorData.error || 'Failed to upload image' };
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error("Upload Error:", error);
    return { success: false, error: error.message || 'Failed to upload image' };
  }
}
