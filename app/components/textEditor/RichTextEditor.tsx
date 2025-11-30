// components/RichTextEditor.tsx
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import TextAlign from "@tiptap/extension-text-align";
import Color from "@tiptap/extension-color";
import Link from "@tiptap/extension-link";
import { CustomImage } from "./CustomImage";
import { FontSize } from "./FontSize";

import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Image as ImageIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Props {
  onChange: (html: string) => void;
  content?: string;
}

export default function RichTextEditor({ onChange, content = "" }: Props) {
  const [linkUrl, setLinkUrl] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        paragraph: { HTMLAttributes: { class: "text-left" } },
        heading: { HTMLAttributes: { class: "text-left" } },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Underline,
      TextStyle,
      Color,
      FontSize,
      Link.configure({
        openOnClick: true,
        linkOnPaste: true,
        HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" },
      }),
      CustomImage, // <- provides 'image' node/commands + NodeView
    ],
    content, // set once at create time
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // If parent updates `content` later (e.g., loading an existing doc), sync once
  const lastApplied = useRef<string | null>(null);
  useEffect(() => {
    if (!editor) return;
    if (
      content &&
      content !== editor.getHTML() &&
      lastApplied.current !== content
    ) {
      editor.commands.setContent(content, false);
      lastApplied.current = content;
    }
  }, [content, editor]);

  if (!editor) return null;

  function isValidUrl(url: string) {
    try {
      const parsed = new URL(url);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  }

  return (
    <div className="border rounded-md space-y-3">
      {/* Toolbar */}
      <div className="flex px-4 py-3 border-b-2 flex-wrap gap-3 items-center">
        {/* Font Size */}
        <select
          onChange={(e) =>
            editor.chain().focus().setFontSize(e.target.value).run()
          }
          className="border px-2 py-1 rounded text-xs"
        >
          <option value="">Size</option>
          <option value="12px">Small</option>
          <option value="16px">Normal</option>
          <option value="20px">Large</option>
          <option value="24px">X-Large</option>
        </select>

        {/* Bold */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className="border p-1 rounded"
        >
          <Bold size={15} />
        </button>

        {/* Italic */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className="border p-1 rounded"
        >
          <Italic size={15} />
        </button>

        {/* Underline */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className="border p-1 rounded"
        >
          <UnderlineIcon size={15} />
        </button>

        {/* Bullet List */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className="border p-1 rounded"
        >
          <List size={15} />
        </button>

        {/* Numbered List */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className="border p-1 rounded"
        >
          <ListOrdered size={15} />
        </button>

        {/* Alignment Buttons */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className="border p-1 rounded"
        >
          <AlignLeft size={15} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className="border p-1 rounded"
        >
          <AlignCenter size={15} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className="border p-1 rounded"
        >
          <AlignRight size={15} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          className="border p-1 rounded"
        >
          <AlignJustify size={15} />
        </button>

        {/* Color Picker */}
        <label className="flex items-center gap-1 cursor-pointer">
          <input
            type="color"
            defaultValue="#000000"
            onChange={(e) =>
              editor.chain().focus().setColor(e.target.value).run()
            }
            className="w-6 h-6 p-0 border rounded"
          />
        </label>

        {/* Hidden file input */}
        <input
          type="file"
          accept="image/*"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file || !editor || editor.isDestroyed) return;

            const reader = new FileReader();
            reader.onload = () => {
              const base64 = reader.result as string;

              // Defer one microtask to avoid colliding with any pending init transaction
              queueMicrotask(() => {
                if (!editor.isDestroyed) {
                  editor.chain().focus().setImage({ src: base64 }).run();
                }
              });
            };
            reader.readAsDataURL(file);

            // reset input so the same file can be selected again if needed
            e.currentTarget.value = "";
          }}
          className="hidden"
          id="image-upload"
        />

        {/* Icon button to trigger input */}
        <label
          htmlFor="image-upload"
          className="border p-1 rounded cursor-pointer"
        >
          <ImageIcon size={15} />
        </label>

        {/* Image align buttons */}
        <button
          type="button"
          className="border p-1 rounded cursor-pointer"
          onClick={() =>
            editor.commands.updateAttributes("image", { align: "left" })
          }
        >
          <AlignLeft size={15} />
        </button>
        <button
          type="button"
          className="border p-1 rounded cursor-pointer"
          onClick={() =>
            editor.commands.updateAttributes("image", { align: "center" })
          }
        >
          <AlignCenter size={15} />
        </button>
        <button
          type="button"
          className="border p-1 rounded cursor-pointer"
          onClick={() =>
            editor.commands.updateAttributes("image", { align: "right" })
          }
        >
          <AlignRight size={15} />
        </button>

        {/* Add Link */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (linkUrl && isValidUrl(linkUrl)) {
                editor
                  .chain()
                  .focus()
                  .extendMarkRange("link")
                  .setLink({ href: linkUrl, target: "_blank" })
                  .run();
                setLinkUrl("");
              } else {
                alert(
                  "Please enter a valid absolute URL (e.g., https://example.com)"
                );
              }
            }}
            className="border p-1 rounded"
          >
            <LinkIcon size={15} />
          </button>

          <input
            type="url"
            placeholder="https://example.com"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="border px-2 py-1 rounded text-xs w-38"
          />
        </div>
      </div>

      {/* Editor Content */}
      <EditorContent
        editor={editor}
        placeholder="Type here..."
        className="
          p-1
          [&_.ProseMirror]:min-h-[300px]
          [&_.ProseMirror]:h-auto
          [&_.ProseMirror]:overflow-visible
          [&_.ProseMirror]:p-0
          [&_.ProseMirror_ul]:list-disc
          [&_.ProseMirror_ol]:list-decimal
          [&_.ProseMirror_ul]:ml-5
          [&_.ProseMirror_ol]:ml-5
          [&_.ProseMirror_li]:my-1
          [&_.ProseMirror_a]:text-blue-600 [&_.ProseMirror_a]:underline [&_.ProseMirror_a]:cursor-pointer
          [&_.ProseMirror]:outline-none
          [&_.ProseMirror]:whitespace-pre-wrap
          [&_.ProseMirror]:cursor-text
          [&_.ProseMirror]:empty:before
          [&_.ProseMirror]:empty:before:content-['Write_here...']
          [&_.ProseMirror]:empty:before:text-gray-400
          [&_.ProseMirror]:empty:before:pointer-events-none
          [&_.ProseMirror_img]:max-w-full
          [&_.ProseMirror_img]:h-auto
          [&_.ProseMirror_img[data-align='left']]:float-left [&_.ProseMirror_img[data-align='left']]:mr-4
          [&_.ProseMirror_img[data-align='right']]:float-right [&_.ProseMirror_img[data-align='right']]:ml-4
          [&_.ProseMirror_img[data-align='center']]:block [&_.ProseMirror_img[data-align='center']]:mx-auto
        "
      />
    </div>
  );
}
