ALTER TABLE public.chat_requests
ADD COLUMN IF NOT EXISTS conversation_id uuid REFERENCES public.conversations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_chat_requests_conversation_id ON public.chat_requests(conversation_id);