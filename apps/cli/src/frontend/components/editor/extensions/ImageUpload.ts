import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Extension } from '@tiptap/core';

export const ImageUpload = Extension.create({
  name: 'imageUpload',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('imageUpload'),
        props: {
          handlePaste: (view, event) => {
            const items = Array.from(event.clipboardData?.items || []);
            const file = items.find((item) => item.type.startsWith('image/'))?.getAsFile();

            if (file) {
              uploadImage(file, view);
              return true; // handled
            }
            return false;
          },
          handleDrop: (view, event) => {
            const file = event.dataTransfer?.files?.[0];
            if (file && file.type.startsWith('image/')) {
              uploadImage(file, view);
              return true; // handled
            }
            return false;
          },
        },
      }),
    ];
  },
});

async function uploadImage(file: File, view: any) {
  // 1. Show placeholder? Or just upload.
  // For now, let's just upload.

  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch('/instructor/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();

    if (data.success) {
      const { schema } = view.state;
      const coordinates = view.posAtCoords({ left: 0, top: 0 }); // naive
      // Better: insert at current selection
      const transaction = view.state.tr.replaceSelectionWith(
        schema.nodes.image.create({ src: data.url, alt: file.name })
      );
      view.dispatch(transaction);
    } else {
        console.error('Upload failed', data.error);
        alert('Upload failed');
    }
  } catch (e) {
    console.error('Upload error', e);
    alert('Upload failed');
  }
}
