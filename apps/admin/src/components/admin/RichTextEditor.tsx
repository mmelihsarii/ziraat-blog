/**
 * Dosyanın görevi: Makale HTML'ini biçimlendirme, Storage görseli ve video gömme araçlarıyla düzenler.
 * Kullanıldığı yerler: app/dashboard/posts/new/page.tsx, app/dashboard/posts/[id]/edit/page.tsx
 */
'use client';

import { useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TiptapLink from '@tiptap/extension-link';
import TiptapImage from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Youtube from '@tiptap/extension-youtube';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link2,
  Image as ImageIcon,
  Minus,
  Video as YoutubeIcon,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadImage } from '@/services/adminService';
import { validateImageFile } from '@/lib/validations';
import { calculateReadingTime } from '@/lib/content';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  error?: string;
}

/** Makale HTML'ini biçimlendirme, Storage görseli ve video gömme araçlarıyla düzenler. */
export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Makale içeriğini buraya yazın...',
  label = 'İçerik',
  required = false,
  error,
}: RichTextEditorProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const editor = useEditor({
    immediatelyRender: false,
    // Sayaçlar ve araç çubuğu her düzenleme işleminde güncel kalmalıdır.
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({ link: false }),
      TiptapLink.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-emerald-600 underline hover:text-emerald-700',
        },
      }),
      TiptapImage.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      CharacterCount,
      Youtube.configure({
        controls: true,
        nocookie: true,
        modestBranding: true,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg max-w-none focus:outline-none min-h-[400px] p-4',
      },
    },
  });

  /** Seçili metne kullanıcıdan alınan güvenli bağlantıyı uygular. */
  const addLink = () => {
    const url = window.prompt('URL:');
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  /** Seçilen makale içi görseli Storage'a yükleyip imleç konumuna ekler. */
  const addImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editor) return;
    const validationError = validateImageFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }
    try {
      setUploadingImage(true);
      const url = await uploadImage(file, 'posts');
      editor.chain().focus().setImage({ src: url, alt: file.name }).run();
      toast.success('Makale görseli eklendi');
    } catch (error) {
      console.error('Article image upload failed:', error);
      toast.error('Makale görseli yüklenemedi');
    } finally {
      setUploadingImage(false);
      event.target.value = '';
    }
  };

  /** YouTube bağlantısını gizlilik geliştirilmiş video bloğu olarak imleç konumuna ekler. */
  const addVideo = () => {
    const url = window.prompt('YouTube video bağlantısı:');
    if (url && editor) editor.chain().focus().setYoutubeVideo({ src: url }).run();
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="space-y-2">
      <label className="block font-display font-bold text-sm text-brand-dark">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

{/* Biçimlendirme araçları */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-t-lg p-2 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-neutral-200 transition-colors ${
            editor.isActive('bold') ? 'bg-neutral-300' : ''
          }`}
          title="Kalın (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-neutral-200 transition-colors ${
            editor.isActive('italic') ? 'bg-neutral-300' : ''
          }`}
          title="İtalik (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 rounded hover:bg-neutral-200 transition-colors ${
            editor.isActive('strike') ? 'bg-neutral-300' : ''
          }`}
          title="Üstü Çizili"
        >
          <Strikethrough className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`p-2 rounded hover:bg-neutral-200 transition-colors ${
            editor.isActive('code') ? 'bg-neutral-300' : ''
          }`}
          title="Kod"
        >
          <Code className="w-4 h-4" />
        </button>

        <div className="w-px h-8 bg-neutral-300 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-neutral-200 transition-colors ${
            editor.isActive('bulletList') ? 'bg-neutral-300' : ''
          }`}
          title="Liste"
        >
          <List className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-neutral-200 transition-colors ${
            editor.isActive('orderedList') ? 'bg-neutral-300' : ''
          }`}
          title="Numaralı Liste"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-neutral-200 transition-colors ${
            editor.isActive('blockquote') ? 'bg-neutral-300' : ''
          }`}
          title="Alıntı"
        >
          <Quote className="w-4 h-4" />
        </button>

        <div className="w-px h-8 bg-neutral-300 mx-1" />

        <button
          type="button"
          onClick={addLink}
          className={`p-2 rounded hover:bg-neutral-200 transition-colors ${
            editor.isActive('link') ? 'bg-neutral-300' : ''
          }`}
          title="Link Ekle"
        >
          <Link2 className="w-4 h-4" />
        </button>

        <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={addImage} className="hidden" />
        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          disabled={uploadingImage}
          className="p-2 rounded hover:bg-neutral-200 transition-colors"
          title="Storage'dan görsel ekle"
        >
          {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
        </button>

        <button
          type="button"
          onClick={addVideo}
          className="p-2 rounded hover:bg-neutral-200 transition-colors"
          title="YouTube videosu ekle"
        >
          <YoutubeIcon className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-2 rounded hover:bg-neutral-200 transition-colors"
          title="Ayırıcı Çizgi"
        >
          <Minus className="w-4 h-4" />
        </button>

        <div className="w-px h-8 bg-neutral-300 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 rounded hover:bg-neutral-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Geri Al (Ctrl+Z)"
        >
          <Undo className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 rounded hover:bg-neutral-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="İleri Al (Ctrl+Y)"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>

{/* Zengin metin alanı */}
      <div className={`bg-white border rounded-b-lg overflow-hidden ${
        error ? 'border-red-500' : 'border-neutral-200'
      }`}>
        <EditorContent editor={editor} />
      </div>

      {error && (
        <p className="text-red-500 text-sm font-sans">{error}</p>
      )}

{/* Karakter, kelime ve okuma süresi */}
      {editor && (
        <div className="flex flex-wrap justify-between items-center gap-3 text-xs text-brand-gray font-sans">
          <div className="flex items-center gap-4">
            <span>{editor.storage.characterCount?.characters() || 0} karakter</span>
            <span>{editor.storage.characterCount?.words() || 0} kelime</span>
          </div>
          <span className="font-bold text-emerald-700">
            Tahmini okuma: {calculateReadingTime(editor.getHTML())} dk
          </span>
        </div>
      )}
    </div>
  );
}
