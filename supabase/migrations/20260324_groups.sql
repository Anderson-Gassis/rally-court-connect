-- Migration corregida: Create groups and group_members tables
-- El error 42601 era por ambigüedad de nombres de columna en las políticas RLS. 
-- Aquí usamos el calificador de tabla completo 'group_members.group_id'.

CREATE TABLE IF NOT EXISTS groups (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  sport_type  TEXT NOT NULL DEFAULT 'tennis',
  owner_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  avatar_url  TEXT,
  is_private  BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS group_members (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id  UUID REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  user_id   UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role      TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (group_id, user_id)
);

-- Trigger auto-update
CREATE OR REPLACE FUNCTION update_groups_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS groups_updated_at ON groups;
CREATE TRIGGER groups_updated_at
  BEFORE UPDATE ON groups
  FOR EACH ROW EXECUTE FUNCTION update_groups_updated_at();

ALTER TABLE groups        ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Polícias de Groups
CREATE POLICY "groups_select"
  ON groups FOR SELECT
  USING (
    is_private = false
    OR owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = id
        AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "groups_insert"
  ON groups FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "groups_update"
  ON groups FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "groups_delete"
  ON groups FOR DELETE
  USING (auth.uid() = owner_id);

-- Polícias de Group Members
CREATE POLICY "group_members_select"
  ON group_members FOR SELECT
  USING (true);

-- IMPORTANTE: Usar alias 'new_row' para resolver ambigüedad en el Check del INSERT
CREATE POLICY "group_members_insert"
  ON group_members FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM group_members existing
      WHERE existing.group_id = group_id
        AND existing.user_id = auth.uid()
        AND existing.role IN ('owner', 'admin')
    )
  );

-- IMPORTANTE: Usar alias 'gm' para resolver ambigüedad en el Delete
CREATE POLICY "group_members_delete"
  ON group_members FOR DELETE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM group_members existing
      WHERE existing.group_id = group_id
        AND existing.user_id = auth.uid()
        AND existing.role IN ('owner', 'admin')
    )
  );
