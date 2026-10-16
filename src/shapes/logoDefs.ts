export interface LogoDefinition {
  id: string;
  name: string;
  file: string;
  // viewBox size of the SVG in public/logos/, used for aspect ratio
  naturalWidth: number;
  naturalHeight: number;
  // Default width when placed on the canvas
  defaultWidth: number;
}

export const LOGOS: LogoDefinition[] = [
  { id: 'red-hat-ai', name: 'Red Hat AI', file: 'logos/red-hat-ai.svg', naturalWidth: 730.23, naturalHeight: 149.119, defaultWidth: 160 },
  { id: 'red-hat-ai-enterprise', name: 'Red Hat AI Enterprise', file: 'logos/red-hat-ai-enterprise.svg', naturalWidth: 734.229, naturalHeight: 244, defaultWidth: 160 },
  { id: 'red-hat-ai-inference', name: 'Red Hat AI Inference', file: 'logos/red-hat-ai-inference.svg', naturalWidth: 738.54, naturalHeight: 244, defaultWidth: 160 },
  { id: 'red-hat-enterprise-linux', name: 'Red Hat Enterprise Linux', file: 'logos/red-hat-enterprise-linux.svg', naturalWidth: 994, naturalHeight: 244, defaultWidth: 160 },
  { id: 'red-hat-enterprise-linux-10', name: 'Red Hat Enterprise Linux 10', file: 'logos/red-hat-enterprise-linux-10.svg', naturalWidth: 1116.368, naturalHeight: 244, defaultWidth: 160 },
  { id: 'red-hat-enterprise-linux-ai', name: 'Red Hat Enterprise Linux AI', file: 'logos/red-hat-enterprise-linux-ai.svg', naturalWidth: 1108.9189, naturalHeight: 244, defaultWidth: 160 },
  { id: 'red-hat-openshift', name: 'Red Hat OpenShift', file: 'logos/red-hat-openshift.svg', naturalWidth: 716.46, naturalHeight: 243.07, defaultWidth: 160 },
  { id: 'red-hat-acm', name: 'Red Hat Advanced Cluster Management', file: 'logos/red-hat-acm.svg', naturalWidth: 1712.77, naturalHeight: 331.27, defaultWidth: 200 },
  { id: 'nvidia-horizontal', name: 'NVIDIA (horizontal)', file: 'logos/nvidia-horizontal.svg', naturalWidth: 2070, naturalHeight: 394, defaultWidth: 120 },
  { id: 'nvidia-vertical', name: 'NVIDIA (vertical)', file: 'logos/nvidia-vertical.svg', naturalWidth: 1223, naturalHeight: 947, defaultWidth: 80 },
];

export function getLogo(id: string | undefined): LogoDefinition | undefined {
  return LOGOS.find((l) => l.id === id);
}

export function logoUrl(logo: LogoDefinition): string {
  return `${import.meta.env.BASE_URL}${logo.file}`;
}

const imageCache = new Map<string, Promise<HTMLImageElement>>();
const dataUrlCache = new Map<string, string>();

/**
 * Load a logo image once and cache it. The SVG source is kept as a data URL so
 * SVG export can embed the vector logo without a network request.
 */
export function loadLogoImage(logo: LogoDefinition): Promise<HTMLImageElement> {
  let pending = imageCache.get(logo.id);
  if (!pending) {
    pending = fetch(logoUrl(logo))
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load ${logo.file}`);
        return res.text();
      })
      .then((svg) => new Promise<HTMLImageElement>((resolve, reject) => {
        const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
        dataUrlCache.set(logo.id, dataUrl);
        const img = new window.Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = dataUrl;
      }));
    pending.catch(() => imageCache.delete(logo.id));
    imageCache.set(logo.id, pending);
  }
  return pending;
}

/** Embedded data URL if the logo has been loaded, otherwise an absolute URL. */
export function getLogoHref(logo: LogoDefinition): string {
  const cached = dataUrlCache.get(logo.id);
  if (cached) return cached;
  return new URL(logoUrl(logo), window.location.href).href;
}
