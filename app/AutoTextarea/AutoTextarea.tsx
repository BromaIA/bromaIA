"use client";
import { useRef, useEffect } from "react";

type Props = {
value: string;
onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
placeholder?: string;
};

export default function AutoTextarea({ value, onChange, onKeyDown, placeholder }: Props) {
const textareaRef = useRef<HTMLTextAreaElement>(null);

useEffect(() => {
if (textareaRef.current) {
textareaRef.current.style.height = "auto";
textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
}
}, [value]);

return (
<textarea
ref={textareaRef}
value={value}
onChange={onChange}
onKeyDown={onKeyDown}
placeholder={placeholder}
rows={1}
className="w-full bg-rose-400 bg-opacity-30 text-white placeholder-gray-200 p-4 pr-12 rounded resize-none focus:outline-none min-h-[60px] overflow-hidden"
/>
);
}

