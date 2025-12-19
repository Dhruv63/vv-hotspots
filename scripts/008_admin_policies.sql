-- Allow admin to insert hotspots
CREATE POLICY "hotspots_insert_admin" ON public.hotspots
FOR INSERT WITH CHECK (
  auth.jwt() ->> 'email' = 'vv.hotspots@gmail.com'
);

-- Allow admin to update hotspots
CREATE POLICY "hotspots_update_admin" ON public.hotspots
FOR UPDATE USING (
  auth.jwt() ->> 'email' = 'vv.hotspots@gmail.com'
);

-- Allow admin to delete hotspots
CREATE POLICY "hotspots_delete_admin" ON public.hotspots
FOR DELETE USING (
  auth.jwt() ->> 'email' = 'vv.hotspots@gmail.com'
);
