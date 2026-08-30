const fs = require('fs');
const path = require('path');

const galleryPath = path.join(__dirname, 'components', 'activity', 'ActivityGallery.tsx');
let galleryContent = fs.readFileSync(galleryPath, 'utf8');

// 1. Import createPortal
galleryContent = galleryContent.replace(
    /import { useState, useEffect, useRef } from "react"/,
    `import { useState, useEffect, useRef } from "react"\nimport { createPortal } from "react-dom"`
);

// 2. Add mounted state
galleryContent = galleryContent.replace(
    /const \[isOpen, setIsOpen\] = useState\(false\)/,
    `const [mounted, setMounted] = useState(false)\n  useEffect(() => setMounted(true), [])\n  const [isOpen, setIsOpen] = useState(false)`
);

// 3. Wrap Lightbox Overlay in createPortal
galleryContent = galleryContent.replace(
    /{isOpen && \(\s*<div\s*className="fixed inset-0 z-\[999999\] bg-black touch-none flex flex-col justify-between select-none"/,
    `{isOpen && mounted && createPortal(
        <div
          className="fixed inset-0 z-[999999] bg-black touch-none flex flex-col justify-between select-none"`
);

galleryContent = galleryContent.replace(
    /<\/button>\s*<\/div>\s*\)}\s*<\/>\s*\)\s*}\s*$/,
    `</button>
        </div>,
        document.body
      )}
    </>
  )
}
`
);

fs.writeFileSync(galleryPath, galleryContent, 'utf8');
console.log('Successfully updated ActivityGallery.tsx');
