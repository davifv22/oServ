declare module 'pdfmake/build/pdfmake' {
  import type { TDocumentDefinitions } from 'pdfmake/interfaces';

  const pdfMake: {
    vfs?: unknown;
    createPdf: (documentDefinitions: TDocumentDefinitions) => {
      open: (options?: Record<string, unknown>, win?: Window | null) => void;
      download: (defaultFileName?: string) => void;
      print: () => void;
    };
  };

  export default pdfMake;
}

declare module 'pdfmake/build/vfs_fonts' {
  const pdfFonts: {
    pdfMake?: { vfs?: unknown };
    vfs?: unknown;
  };

  export default pdfFonts;
}
