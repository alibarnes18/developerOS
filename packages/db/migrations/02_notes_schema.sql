-- ==========================================
-- NOTES TABLE FOR v0.2
-- ==========================================
CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on notes table
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Notes Policies: Users can manage notes within workspaces they own
CREATE POLICY "Users can manage notes in owned workspaces"
    ON notes
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM workspaces 
            WHERE workspaces.id = notes.workspace_id 
            AND workspaces.owner_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM workspaces 
            WHERE workspaces.id = notes.workspace_id 
            AND workspaces.owner_id = auth.uid()
        )
    );

-- Set updated_at trigger
CREATE TRIGGER update_notes_updated_at
    BEFORE UPDATE ON notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
