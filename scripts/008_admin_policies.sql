-- Allow admin to insert hotspots
CREATE POLICY "hotspots_insert_admin" ON public.hotspots
FOR INSERT WITH CHECK (
 feat/admin-panel-megahack
  auth.jwt() ->> 'email' = 'megahack785@gmail.com'
 main
);

-- Allow admin to update hotspots
CREATE POLICY "hotspots_update_admin" ON public.hotspots
FOR UPDATE USING (
 feat/admin-panel-megahack
  auth.jwt() ->> 'email' = 'megahack785@gmail.com'
 main
);

-- Allow admin to delete hotspots
CREATE POLICY "hotspots_delete_admin" ON public.hotspots
FOR DELETE USING (
 feat/admin-panel-megahack
  auth.jwt() ->> 'email' = 'megahack785@gmail.com'

>> main
);
