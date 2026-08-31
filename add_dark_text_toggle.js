const fs = require('fs');
const path = require('path');

// 1. Update IntroSlideConfig.tsx
const introPath = path.join(__dirname, 'components', 'admin', 'IntroSlideConfig.tsx');
let introContent = fs.readFileSync(introPath, 'utf8');

// Add useDarkText to state
introContent = introContent.replace(
    `cover_image_url: initialData?.cover_image_url || ""`,
    `cover_image_url: initialData?.cover_image_url || "",\n    useDarkText: initialData?.useDarkText || false`
);

// Add checkbox UI
const checkboxUI = `
        <div className="space-y-1 md:col-span-2 pt-2">
          <label className="flex items-center gap-2 cursor-pointer w-fit">
            <input 
              type="checkbox" 
              checked={data.useDarkText}
              onChange={(e) => setData({ ...data, useDarkText: e.target.checked })}
              className="w-4 h-4 text-rose-500 rounded border-zinc-300 focus:ring-rose-500"
            />
            <span className="text-sm font-semibold text-zinc-700">Use Dark Text (for bright background images)</span>
          </label>
        </div>`;

// Insert before the Save button container
introContent = introContent.replace(
    `      <div className="pt-2 flex justify-end">`,
    `      </div>\n${checkboxUI}\n\n      <div className="pt-2 flex justify-end">`
);
// Wait, the grid container ends before the Save button container.
// Let's just insert it at the end of the grid container.
// The grid container ends with `</div>` before `<div className="pt-2 flex justify-end">`.
// Actually, let's insert it inside the grid container.
// The grid container is `<div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">`
// It ends with `</div>` right before `<div className="pt-2 flex justify-end">`.
// Let's replace `      </div>\n\n      <div className="pt-2 flex justify-end">`
// with `        ${checkboxUI}\n      </div>\n\n      <div className="pt-2 flex justify-end">`

// Let's do it safely:
introContent = introContent.replace(
    `          )}
        </div>
      </div>

      <div className="pt-2 flex justify-end">`,
    `          )}
        </div>${checkboxUI}
      </div>

      <div className="pt-2 flex justify-end">`
);

fs.writeFileSync(introPath, introContent, 'utf8');
console.log('Successfully updated IntroSlideConfig.tsx');

// 2. Update HeroCarousel.tsx
const heroPath = path.join(__dirname, 'components', 'home', 'HeroCarousel.tsx');
let heroContent = fs.readFileSync(heroPath, 'utf8');

heroContent = heroContent.replace(
    `use_dark_text_desktop: introSlide?.use_dark_text_desktop || false,`,
    `use_dark_text_desktop: introSlide?.use_dark_text_desktop || introSlide?.useDarkText || false,`
);

heroContent = heroContent.replace(
    `use_dark_text_mobile: introSlide?.use_dark_text_mobile || false`,
    `use_dark_text_mobile: introSlide?.use_dark_text_mobile || introSlide?.useDarkText || false`
);

fs.writeFileSync(heroPath, heroContent, 'utf8');
console.log('Successfully updated HeroCarousel.tsx');
