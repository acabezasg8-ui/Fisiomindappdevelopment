import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';

type PDFViewerProps = {
  file: File | null;
  onClose?: () => void;
};

export function PDFViewer({ file, onClose }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pageImage, setPageImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!file) return;

    const loadPDF = async () => {
      try {
        setIsLoading(true);
        const pdfjsLib = await import('pdfjs-dist@3.11.174');
        const pdfjs = pdfjsLib.default || pdfjsLib;

        if (pdfjs.GlobalWorkerOptions) {
          pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
        }

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        
        setPdfDoc(pdf);
        setNumPages(pdf.numPages);
        setPageNumber(1);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading PDF:', error);
        setIsLoading(false);
      }
    };

    loadPDF();
  }, [file]);

  useEffect(() => {
    if (!pdfDoc || pageNumber < 1 || pageNumber > numPages) return;

    const renderPage = async () => {
      try {
        const page = await pdfDoc.getPage(pageNumber);
        const viewport = page.getViewport({ scale });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        const imageData = canvas.toDataURL();
        setPageImage(imageData);
      } catch (error) {
        console.error('Error rendering page:', error);
      }
    };

    renderPage();
  }, [pdfDoc, pageNumber, scale, numPages]);

  const goToPrevPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };

  const goToNextPage = () => {
    if (pageNumber < numPages) {
      setPageNumber(pageNumber + 1);
    }
  };

  const zoomIn = () => {
    setScale(Math.min(scale + 0.25, 3.0));
  };

  const zoomOut = () => {
    setScale(Math.max(scale - 0.25, 0.5));
  };

  const resetZoom = () => {
    setScale(1.0);
  };

  if (!file) {
    return (
      <div className="flex items-center justify-center h-full text-[#6e6e73]">
        <div className="text-center space-y-3">
          <FileText className="w-16 h-16 mx-auto opacity-30" />
          <p>No hay archivo para visualizar</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 mx-auto border-4 border-[#0071e3]/30 border-t-[#0071e3] rounded-full animate-spin"></div>
          <p className="text-[#6e6e73]">Cargando PDF...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/50 backdrop-blur-sm border-b border-[#d2d2d7] rounded-t-2xl flex-shrink-0">
        <div className="flex items-center gap-2">
          <Badge className="bg-[#0071e3]/10 text-[#0071e3] border-none">
            Página {pageNumber} de {numPages}
          </Badge>
          <Badge className="bg-[#6e6e73]/10 text-[#6e6e73] border-none">
            {Math.round(scale * 100)}%
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <Button
            onClick={zoomOut}
            variant="outline"
            size="sm"
            className="border-[#d2d2d7] rounded-lg h-8 w-8 p-0"
            disabled={scale <= 0.5}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button
            onClick={resetZoom}
            variant="outline"
            size="sm"
            className="border-[#d2d2d7] rounded-lg h-8 px-2 text-xs"
          >
            Ajustar
          </Button>
          <Button
            onClick={zoomIn}
            variant="outline"
            size="sm"
            className="border-[#d2d2d7] rounded-lg h-8 w-8 p-0"
            disabled={scale >= 3.0}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          
          {/* Page navigation */}
          <div className="w-px h-6 bg-[#d2d2d7] mx-1"></div>
          <Button
            onClick={goToPrevPage}
            variant="outline"
            size="sm"
            className="border-[#d2d2d7] rounded-lg h-8 w-8 p-0"
            disabled={pageNumber <= 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            onClick={goToNextPage}
            variant="outline"
            size="sm"
            className="border-[#d2d2d7] rounded-lg h-8 w-8 p-0"
            disabled={pageNumber >= numPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* PDF Display */}
      <div className="flex-1 overflow-auto min-h-0">
        <ScrollArea className="h-full w-full">
          <div className="flex justify-center items-start p-4 min-h-full">
            {pageImage ? (
              <img
                src={pageImage}
                alt={`Página ${pageNumber}`}
                className="border border-[#d2d2d7] rounded-lg shadow-lg w-auto h-auto"
                style={{ 
                  maxWidth: '100%',
                  height: 'auto',
                  display: 'block'
                }}
              />
            ) : (
              <div className="text-center text-[#6e6e73] py-8">
                Cargando página...
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}