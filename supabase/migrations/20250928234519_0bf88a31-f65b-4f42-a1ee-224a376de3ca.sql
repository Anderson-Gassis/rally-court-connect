-- Create storage bucket for court images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('court-images', 'court-images', true);

-- Create policies for court images
CREATE POLICY "Anyone can view court images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'court-images');

CREATE POLICY "Authenticated users can upload court images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'court-images' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update their own court images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'court-images' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete their own court images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'court-images' 
  AND auth.uid() IS NOT NULL
);