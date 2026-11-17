
"use client";

import { useRef } from "react";
import {
    Bold,
    Italic,
    Underline,
    List,
    ListOrdered,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Undo2,
    Redo2,
} from "lucide-react";

interface DocumentRichTextEditorProps {
    title: string;
    description: string;
    initialContent?: string;
    onSave: (content: string) => void;
    onCancel: () => void;
}

export default function DocumentRichTextEditor({
    title,
    description,
    initialContent = "",
    onSave,
    onCancel,
}: DocumentRichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);

    const format = (command: string, value?: string) => {
        editorRef.current?.focus();
        document.execCommand(command, false, value);
    };

    const handleSave = () => {
        const content = editorRef.current?.innerHTML || "";
        onSave(content);
    };

    const toolbar = [
        { icon: Bold, command: "bold", label: "Bold" },
        { icon: Italic, command: "italic", label: "Italic" },
        { icon: Underline, command: "underline", label: "Underline" },
        { icon: List, command: "insertUnorderedList", label: "Bullet List" },
        { icon: ListOrdered, command: "insertOrderedList", label: "Numbered List" },
        { icon: AlignLeft, command: "justifyLeft", label: "Align Left" },
        { icon: AlignCenter, command: "justifyCenter", label: "Align Center" },
        { icon: AlignRight, command: "justifyRight", label: "Align Right" },
    ];

    return (
        <div className="space-y-5">
            <div>
                <h2 className="text-lg font-semibold text-white">
                    {title}
                </h2>
                <p className="mt-1 text-sm text-zinc-400">
                    {description}
                </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-1 border-b border-zinc-800 p-3">
                    {toolbar.map((item) => {
                        const Icon = item.icon;

                        return (
                            <button
                                key={item.command}
                                type="button"
                                title={item.label}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => format(item.command)}
                                className="rounded-md p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
                            >
                                <Icon size={17} />
                            </button>
                        );
                    })}

                    <div className="mx-1 h-6 w-px bg-zinc-700" />

                    <button
                        type="button"
                        title="Undo"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => format("undo")}
                        className="rounded-md p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    >
                        <Undo2 size={17} />
                    </button>

                    <button
                        type="button"
                        title="Redo"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => format("redo")}
                        className="rounded-md p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    >
                        <Redo2 size={17} />
                    </button>
                </div>

                {/* Editor */}
                <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    dangerouslySetInnerHTML={{
                        __html: initialContent,
                    }}
                    data-placeholder="Start typing your content here..."
                    className="min-h-[280px] whitespace-pre-wrap p-5 text-sm leading-7 text-zinc-200 outline-none empty:before:text-zinc-600 empty:before:content-[attr(data-placeholder)] [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:my-1 [&_p]:my-2"
                />
            </div>

            <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-lg border border-zinc-700 px-5 py-2.5 text-sm text-zinc-300 transition hover:bg-zinc-800"
                >
                    Cancel
                </button>

                <button
                    type="button"
                    disabled={false}
                    onClick={handleSave}
                    className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200"
                >
                    Save Content
                </button>
            </div>
        </div>
    );
}