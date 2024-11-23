import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Image } from 'lucide-react';

interface ImageUploadProps {
  onUpload: (file: File) => Promise<void>;
}

export default function ImageUpload({ onUpload }: ImageUploadProps) {
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        await onUpload(file);
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    multiple: false
  });

  return (
    <div
      {...getRootProps()}
      className={`cursor-pointer p-2 rounded-full hover:bg-gray-100 transition-colors ${
        isDragActive ? 'bg-blue-50' : ''
      }`}
    >
      <input {...getInputProps()} />
      <Image size={20} className="text-gray-500" />
    </div>
  );
}