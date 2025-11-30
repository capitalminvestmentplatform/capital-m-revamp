// components/CustomImage.ts
import Image from "@tiptap/extension-image";

function mergeStyle(...items: Array<string | null | undefined>) {
  return items.filter(Boolean).join(" ");
}

export const CustomImage = Image.extend({
  // keep name = 'image' from base extension

  addAttributes() {
    const parent = this.parent?.() ?? {};

    // Don't override 'src' parse/render from parent
    return {
      ...parent,

      width: {
        default: "100%",
        renderHTML: (attrs) => ({
          // Style on <img>; centering is handled by the wrapper in the NodeView
          style: mergeStyle(
            `width:${attrs.width}; display:block; margin:0 auto;`
          ),
        }),
      },

      align: {
        default: "center",
        parseHTML: (el) => el.getAttribute("data-align") || "center",
        renderHTML: (attrs) => ({
          "data-align": attrs.align,
        }),
      },
    };
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      const wrapper = document.createElement("span");
      wrapper.style.display = "block";
      wrapper.style.position = "relative";
      wrapper.style.textAlign = node.attrs.align || "center";

      const img = document.createElement("img");
      img.src = node.attrs.src;
      img.alt = node.attrs.alt || "";
      img.style.width = node.attrs.width || "100%";
      img.style.height = "auto";
      img.style.display = "inline-block";

      const handle = document.createElement("span");
      handle.style.position = "absolute";
      handle.style.width = "10px";
      handle.style.height = "10px";
      handle.style.background = "#aaa";
      handle.style.cursor = "nwse-resize";
      handle.style.borderRadius = "2px";
      handle.style.bottom = "0";
      handle.style.right = "0";
      handle.style.boxShadow = "0 0 0 1px rgba(0,0,0,.2)";

      let startX = 0;
      let startWidth = 0;

      const onMouseMove = (e: MouseEvent) => {
        const dx = e.clientX - startX;
        const newWidth = Math.max(40, startWidth + dx);
        img.style.width = `${newWidth}px`;
      };

      const onMouseUp = () => {
        const pos = getPos();
        if (typeof pos === "number") {
          editor
            .chain()
            .setNodeSelection(pos)
            .updateAttributes("image", { width: img.style.width })
            .run();
        }
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      handle.addEventListener("mousedown", (e) => {
        e.preventDefault();
        startX = e.clientX;
        startWidth = img.offsetWidth;
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
      });

      wrapper.appendChild(img);
      wrapper.appendChild(handle);

      return { dom: wrapper };
    };
  },
});
