import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, BookOpen, Send, Sparkles, Brain, MessageCircle, FileText, Lightbulb, HelpCircle, RefreshCw, Upload, File, Image as ImageIcon, X, FileType } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import { explainStudyContent, generateStudyQuiz } from '../utils/supabase/client';

type Message = {
  role: 'student' | 'tutor';
  content: string;
  isLoading?: boolean;
};

type UploadedFile = {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'text';
  content: string;
  url?: string;
  size: number;
};

type FisioStudyScreenProps = {
  onBackToHome: () => void;
};

export function FisioStudyScreen({ onBackToHome }: FisioStudyScreenProps) {
  const [studyContent, setStudyContent] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasContent, setHasContent] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizData, setQuizData] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      // Importar pdfjs-dist con versión específica
      const pdfjsLib = await import('pdfjs-dist@3.11.174');
      
      // Configurar worker con URL completa
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

      const arrayBuffer = await file.arrayBuffer();
      
      console.log('Loading PDF:', file.name, 'Size:', file.size);
      
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      console.log(`PDF loaded. Total pages: ${pdf.numPages}`);
      
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n\n';
        console.log(`Extracted text from page ${i}/${pdf.numPages}`);
      }
      
      console.log(`Total extracted text length: ${fullText.length} characters`);
      
      if (fullText.trim().length === 0) {
        toast.warning(`El PDF "${file.name}" no contiene texto extraíble. Puede ser un PDF escaneado (imagen).`);
        return `[PDF sin texto extraíble: ${file.name}. Nota: Este PDF puede contener solo imágenes. Considera usar OCR o describir el contenido manualmente.]`;
      }
      
      return fullText.trim();
    } catch (error) {
      console.error('Error extracting PDF text:', error);
      toast.error(`Error al extraer texto del PDF: ${error.message}`);
      throw error;
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsLoading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileId = `${Date.now()}-${i}`;

      try {
        // Sin límite de tamaño - los estudiantes pueden subir todo el contenido que necesiten
        // if (file.size > 10 * 1024 * 1024) {
        //   toast.error(`${file.name} es demasiado grande (máximo 10MB)`);
        //   continue;
        // }

        if (file.type === 'application/pdf') {
          // Procesar PDF
          toast.info(`Extrayendo texto de ${file.name}...`);
          const text = await extractTextFromPDF(file);
          
          setUploadedFiles(prev => [...prev, {
            id: fileId,
            name: file.name,
            type: 'pdf',
            content: text,
            size: file.size,
          }]);
          
          toast.success(`PDF cargado: ${file.name}`);
        } else if (file.type.startsWith('image/')) {
          // Procesar imagen
          const reader = new FileReader();
          reader.onload = (e) => {
            const imageUrl = e.target?.result as string;
            
            setUploadedFiles(prev => [...prev, {
              id: fileId,
              name: file.name,
              type: 'image',
              content: `[Imagen: ${file.name}]`,
              url: imageUrl,
              size: file.size,
            }]);
            
            toast.success(`Imagen cargada: ${file.name}`);
          };
          reader.readAsDataURL(file);
        } else if (file.type === 'text/plain') {
          // Procesar archivo de texto
          const reader = new FileReader();
          reader.onload = (e) => {
            const text = e.target?.result as string;
            
            setUploadedFiles(prev => [...prev, {
              id: fileId,
              name: file.name,
              type: 'text',
              content: text,
              size: file.size,
            }]);
            
            toast.success(`Archivo de texto cargado: ${file.name}`);
          };
          reader.readAsText(file);
        } else {
          toast.error(`Tipo de archivo no soportado: ${file.name}`);
        }
      } catch (error) {
        console.error('Error processing file:', error);
        toast.error(`Error al procesar ${file.name}`);
      }
    }

    setIsLoading(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    toast.success('Archivo eliminado');
  };

  const getCombinedContent = (): string => {
    let combined = studyContent.trim();
    
    if (uploadedFiles.length > 0) {
      combined += '\n\n--- ARCHIVOS CARGADOS ---\n\n';
      uploadedFiles.forEach(file => {
        combined += `\n[${file.name}]\n${file.content}\n\n`;
      });
    }
    
    return combined;
  };

  const handleLoadContent = () => {
    const totalContent = getCombinedContent();
    
    if (totalContent.trim().length < 50) {
      toast.error('Por favor, escribe contenido o carga archivos (mínimo 50 caracteres)');
      return;
    }

    setHasContent(true);
    
    const fileCount = uploadedFiles.length;
    const fileTypes = uploadedFiles.map(f => f.type).join(', ');
    
    let welcomeMessage = '¡Perfecto! He cargado tu contenido';
    if (fileCount > 0) {
      welcomeMessage += ` incluyendo ${fileCount} archivo${fileCount > 1 ? 's' : ''} (${fileTypes})`;
    }
    welcomeMessage += '. Estoy listo para ayudarte a comprenderlo mejor. Puedes preguntarme lo que necesites o pedirme que te explique conceptos específicos.';
    
    setMessages([
      {
        role: 'tutor',
        content: welcomeMessage,
      },
    ]);
    toast.success('Contenido cargado correctamente');
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;

    const userMessage = currentMessage.trim();
    setCurrentMessage('');

    // Añadir mensaje del usuario
    const newMessages: Message[] = [
      ...messages,
      { role: 'student', content: userMessage },
      { role: 'tutor', content: '', isLoading: true },
    ];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const fullContent = getCombinedContent();
      const response = await explainStudyContent(fullContent, userMessage, messages);

      // Reemplazar el mensaje de carga con la respuesta
      setMessages([
        ...messages,
        { role: 'student', content: userMessage },
        { role: 'tutor', content: response },
      ]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setMessages([
        ...messages,
        { role: 'student', content: userMessage },
        {
          role: 'tutor',
          content: 'Lo siento, ha ocurrido un error al procesar tu pregunta. Por favor, inténtalo de nuevo.',
        },
      ]);
      toast.error('Error al obtener respuesta de la IA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    let message = '';
    switch (action) {
      case 'explain':
        message = 'Explícame el concepto principal de este tema de forma más comprensible';
        break;
      case 'example':
        message = 'Dame un ejemplo práctico clínico relacionado con este tema';
        break;
      case 'simplify':
        message = 'Explícamelo de otra forma, más simple';
        break;
      case 'questions':
        message = '¿Qué preguntas importantes debería hacerme sobre este tema?';
        break;
    }
    setCurrentMessage(message);
  };

  const handleGenerateQuiz = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setShowQuiz(true);

    try {
      const fullContent = getCombinedContent();
      const quiz = await generateStudyQuiz(fullContent);
      setQuizData(quiz);
      toast.success('Evaluación generada correctamente');
    } catch (error) {
      console.error('Error generating quiz:', error);
      toast.error('Error al generar la evaluación');
      setShowQuiz(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetContent = () => {
    setStudyContent('');
    setUploadedFiles([]);
    setMessages([]);
    setHasContent(false);
    setShowQuiz(false);
    setQuizData(null);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="min-h-screen p-6 bg-[#f5f5f7]">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl text-[#1d1d1f] font-semibold">FisioStudy</h1>
              <p className="text-[#6e6e73]">Entiende la teoría como nunca antes</p>
            </div>
          </div>
          <Button
            onClick={onBackToHome}
            className="bg-white hover:bg-gray-50 border-2 border-[#d2d2d7] text-[#1d1d1f] rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Inicio
          </Button>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Panel de contenido */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass shadow-apple-lg rounded-3xl p-8 h-[calc(100vh-200px)] flex flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0071e3]/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-[#0071e3]" />
                </div>
                <h2 className="text-2xl text-[#1d1d1f] font-semibold">Tu Contenido de Estudio</h2>
              </div>
              {hasContent && (
                <Button
                  onClick={handleResetContent}
                  variant="outline"
                  className="border-[#d2d2d7] text-[#6e6e73] hover:text-[#1d1d1f] rounded-xl"
                  size="sm"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Nuevo Tema
                </Button>
              )}
            </div>

            <div className="flex-1 flex flex-col space-y-4">
              {/* Área de carga de archivos */}
              {!hasContent && (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                    isDragging
                      ? 'border-[#0071e3] bg-[#0071e3]/5'
                      : 'border-[#d2d2d7] hover:border-[#0071e3]/50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.txt,image/*"
                    multiple
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                  />
                  
                  <div className="space-y-3">
                    <div className="w-16 h-16 mx-auto rounded-full bg-[#0071e3]/10 flex items-center justify-center">
                      <Upload className="w-8 h-8 text-[#0071e3]" />
                    </div>
                    <div>
                      <p className="text-[#1d1d1f] font-medium">
                        Arrastra archivos aquí o{' '}
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="text-[#0071e3] hover:underline"
                        >
                          selecciona archivos
                        </button>
                      </p>
                      <p className="text-sm text-[#6e6e73] mt-1">
                        Soporta: PDF, TXT, imágenes (JPG, PNG) • Sin límite de tamaño
                      </p>
                      <p className="text-xs text-[#ff9500] mt-2 bg-[#ff9500]/10 rounded-lg p-2">
                        ⚠️ PDFs escaneados (imágenes): Copia y pega el texto manualmente
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Lista de archivos cargados */}
              {uploadedFiles.length > 0 && !hasContent && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-[#6e6e73]">Archivos cargados:</p>
                  <ScrollArea className="max-h-32">
                    <div className="space-y-2">
                      {uploadedFiles.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between bg-white/50 rounded-xl p-3 border border-[#d2d2d7]"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {file.type === 'pdf' && (
                              <FileType className="w-5 h-5 text-red-500 flex-shrink-0" />
                            )}
                            {file.type === 'image' && (
                              <ImageIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                            )}
                            {file.type === 'text' && (
                              <File className="w-5 h-5 text-gray-500 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-[#1d1d1f] truncate">{file.name}</p>
                              <p className="text-xs text-[#6e6e73]">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                          <Button
                            onClick={() => removeFile(file.id)}
                            variant="ghost"
                            size="sm"
                            className="text-[#ff3b30] hover:bg-[#ff3b30]/10 rounded-lg flex-shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {/* Vista previa de imágenes cuando ya hay contenido */}
              {hasContent && uploadedFiles.some(f => f.type === 'image') && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-[#6e6e73]">Imágenes cargadas:</p>
                  <div className="grid grid-cols-3 gap-2">
                    {uploadedFiles
                      .filter(f => f.type === 'image')
                      .map((file) => (
                        <div key={file.id} className="relative group">
                          <img
                            src={file.url}
                            alt={file.name}
                            className="w-full h-20 object-cover rounded-xl border border-[#d2d2d7]"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                            <p className="text-white text-xs px-2 text-center">{file.name}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Área de texto */}
              <Textarea
                value={studyContent}
                onChange={(e) => setStudyContent(e.target.value)}
                placeholder="Escribe o pega aquí tus apuntes, temas de clase o cualquier contenido teórico de fisioterapía...&#10;&#10;También puedes cargar archivos PDF, imágenes o documentos de texto usando el área de arriba."
                className="flex-1 resize-none bg-white/50 border-[#d2d2d7] rounded-2xl p-4 text-[#1d1d1f] placeholder:text-[#6e6e73] focus:ring-2 focus:ring-[#0071e3] focus:border-transparent"
                disabled={hasContent}
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-[#6e6e73]">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>{studyContent.length} caracteres</span>
                  </div>
                  {uploadedFiles.length > 0 && (
                    <Badge className="bg-[#0071e3]/10 text-[#0071e3] border-none">
                      {uploadedFiles.length} archivo{uploadedFiles.length > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
                {!hasContent && (
                  <Button
                    onClick={handleLoadContent}
                    disabled={getCombinedContent().trim().length < 50 || isLoading}
                    className="bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-2xl shadow-lg"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4 mr-2" />
                        Cargar Contenido
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Panel de chat con IA */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass shadow-apple-lg rounded-3xl p-8 h-[calc(100vh-200px)] flex flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#34c759]/10 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-[#34c759]" />
                </div>
                <h2 className="text-2xl text-[#1d1d1f] font-semibold">Tutor IA</h2>
              </div>
              {hasContent && (
                <Badge className="bg-[#34c759]/10 text-[#34c759] border-none">
                  Activo
                </Badge>
              )}
            </div>

            {!hasContent ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-4 max-w-md">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center mx-auto opacity-20">
                    <Brain className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl text-[#1d1d1f] font-semibold">
                    Carga tu contenido para empezar
                  </h3>
                  <p className="text-[#6e6e73] leading-relaxed">
                    Puedes escribir texto directamente o cargar archivos PDF, documentos de texto o imágenes.
                    Una vez cargado, podré ayudarte a comprenderlo mejor.
                  </p>
                </div>
              </div>
            ) : showQuiz && quizData ? (
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg text-[#1d1d1f] font-semibold">Evaluación de Comprensión</h3>
                  <Button
                    onClick={() => setShowQuiz(false)}
                    variant="outline"
                    size="sm"
                    className="border-[#d2d2d7] rounded-xl"
                  >
                    Volver al Chat
                  </Button>
                </div>
                <ScrollArea className="flex-1 pr-4">
                  <div className="space-y-6">
                    {/* Resumen */}
                    {quizData.summary && (
                      <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-[#d2d2d7]">
                        <h4 className="text-md text-[#1d1d1f] font-semibold mb-3 flex items-center gap-2">
                          <Lightbulb className="w-5 h-5 text-[#ff9500]" />
                          Resumen del Tema
                        </h4>
                        <p className="text-[#6e6e73] leading-relaxed whitespace-pre-wrap">{quizData.summary}</p>
                      </div>
                    )}

                    {/* Preguntas */}
                    {quizData.questions && quizData.questions.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="text-md text-[#1d1d1f] font-semibold flex items-center gap-2">
                          <HelpCircle className="w-5 h-5 text-[#0071e3]" />
                          Preguntas de Autoevaluación
                        </h4>
                        {quizData.questions.map((q: any, index: number) => (
                          <div
                            key={index}
                            className="bg-white/50 backdrop-blur-sm rounded-2xl p-5 border border-[#d2d2d7]"
                          >
                            <p className="text-[#1d1d1f] font-medium mb-3">
                              {index + 1}. {q.question}
                            </p>
                            <div className="space-y-2">
                              {q.options?.map((option: string, optIndex: number) => (
                                <div
                                  key={optIndex}
                                  className="bg-white rounded-xl p-3 border border-[#d2d2d7] text-sm text-[#6e6e73]"
                                >
                                  {String.fromCharCode(65 + optIndex)}. {option}
                                </div>
                              ))}
                            </div>
                            {q.correctAnswer && (
                              <div className="mt-3 p-3 bg-[#34c759]/10 rounded-xl">
                                <p className="text-sm text-[#34c759] font-medium">
                                  Respuesta correcta: {q.correctAnswer}
                                </p>
                                {q.explanation && (
                                  <p className="text-xs text-[#6e6e73] mt-1">{q.explanation}</p>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            ) : (
              <>
                {/* Chat messages */}
                <ScrollArea className="flex-1 pr-4 mb-4" ref={chatScrollRef}>
                  <div className="space-y-4">
                    <AnimatePresence>
                      {messages.map((msg, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className={`flex ${msg.role === 'student' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-2xl p-4 ${
                              msg.role === 'student'
                                ? 'bg-[#0071e3] text-white'
                                : 'bg-white border border-[#d2d2d7] text-[#1d1d1f]'
                            }`}
                          >
                            {msg.isLoading ? (
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-[#6e6e73] rounded-full animate-bounce"></div>
                                <div
                                  className="w-2 h-2 bg-[#6e6e73] rounded-full animate-bounce"
                                  style={{ animationDelay: '0.2s' }}
                                ></div>
                                <div
                                  className="w-2 h-2 bg-[#6e6e73] rounded-full animate-bounce"
                                  style={{ animationDelay: '0.4s' }}
                                ></div>
                              </div>
                            ) : (
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Quick actions */}
                <div className="mb-4 flex flex-wrap gap-2">
                  <Button
                    onClick={() => handleQuickAction('explain')}
                    variant="outline"
                    size="sm"
                    className="border-[#d2d2d7] text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-white rounded-xl text-xs"
                    disabled={isLoading}
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    Explicar concepto
                  </Button>
                  <Button
                    onClick={() => handleQuickAction('example')}
                    variant="outline"
                    size="sm"
                    className="border-[#d2d2d7] text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-white rounded-xl text-xs"
                    disabled={isLoading}
                  >
                    <Lightbulb className="w-3 h-3 mr-1" />
                    Ejemplo clínico
                  </Button>
                  <Button
                    onClick={() => handleQuickAction('simplify')}
                    variant="outline"
                    size="sm"
                    className="border-[#d2d2d7] text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-white rounded-xl text-xs"
                    disabled={isLoading}
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Simplificar
                  </Button>
                  <Button
                    onClick={() => handleQuickAction('questions')}
                    variant="outline"
                    size="sm"
                    className="border-[#d2d2d7] text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-white rounded-xl text-xs"
                    disabled={isLoading}
                  >
                    <HelpCircle className="w-3 h-3 mr-1" />
                    Preguntas clave
                  </Button>
                </div>

                {/* Input area */}
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Textarea
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Escribe tu pregunta o petición..."
                      className="resize-none bg-white border-[#d2d2d7] rounded-2xl p-3 text-sm text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3] focus:border-transparent"
                      rows={2}
                      disabled={isLoading}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!currentMessage.trim() || isLoading}
                      className="bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-2xl px-4"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>

                  <Button
                    onClick={handleGenerateQuiz}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-[#0071e3] to-[#0077ed] hover:from-[#0077ed] hover:to-[#0071e3] text-white rounded-2xl shadow-lg"
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    Evaluar mi Comprensión
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}