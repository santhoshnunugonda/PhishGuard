'use client';

import HeaderNavigation from "@/components/sections/header-navigation";
import Footer from "@/components/sections/footer";
import { Play, Clock, Award, ChevronRight, Loader2, CheckCircle, XCircle, ArrowRight, PlayCircle, BookOpen, TrendingUp, Users } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase";
import { updateUserStats } from "@/lib/updateUserStats";
import Link from "next/link";

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

type Quiz = {
  question: string;
  options: string[];
  correctIndex: number;
};

type Module = {
  id: number | string;
  title: string;
  description: string;
  duration: string;
  video_id: string;
  level: string;
  points: number;
  quiz: Quiz[];
};

const fallbackModules: Module[] = [
  {
    id: 1,
    title: "Phishing Fundamentals",
    description: "Learn what phishing is, why it matters, and the psychology behind attacks.",
    duration: "8 min",
    video_id: "XBkzBrXlle0",
    level: "Beginner",
    points: 15,
    quiz: [
      { question: "What is the primary goal of a phishing attack?", options: ["To improve email security", "To steal sensitive information", "To send marketing emails", "To test network speed"], correctIndex: 1 },
      { question: "Which is a common psychological tactic used in phishing?", options: ["Creating urgency", "Providing receipts", "Using letterheads", "Sending attachments"], correctIndex: 0 },
      { question: "What percentage of data breaches involve phishing?", options: ["Less than 10%", "Around 25%", "Over 90%", "Exactly 50%"], correctIndex: 2 }
    ]
  },
  {
    id: 2,
    title: "Email Header Analysis",
    description: "Master the art of analyzing email headers to detect spoofed senders.",
    duration: "10 min",
    video_id: "Y7zNhPvYBWc",
    level: "Beginner",
    points: 15,
    quiz: [
      { question: "What does the 'From' field actually indicate?", options: ["Verified sender", "Display name (can be spoofed)", "Server IP", "Encryption status"], correctIndex: 1 },
      { question: "Which field shows the email's path?", options: ["Subject", "Received", "Reply-To", "Content-Type"], correctIndex: 1 },
      { question: "From/Return-Path mismatch often indicates:", options: ["Legitimate email", "Phishing attempt", "Encrypted message", "High priority"], correctIndex: 1 }
    ]
  }
];

export default function LearnPage() {
  const [modules, setModules] = useState<Module[]>(fallbackModules);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [completedModules, setCompletedModules] = useState<(number | string)[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<boolean[]>([]);
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [videoFinished, setVideoFinished] = useState(false);
  const [completing, setCompleting] = useState(false);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => setLoading(false), 8000);
    
    const fetchModules = async () => {
      try {
        const supabase = createClient();
        
        const { data: modulesData, error: modulesError } = await supabase
          .from('learn_modules')
          .select('*')
          .order('order_index', { ascending: true });

        if (modulesError) throw modulesError;

          if (modulesData && modulesData.length > 0) {
            const mapped = modulesData.map((m: any) => ({
              id: m.id,
              title: m.title,
              description: m.description,
              duration: m.duration || '8 min',
              video_id: m.video_url || '',
              level: m.level || 'Beginner',
              points: m.points || 15,
              quiz: m.quiz || [],
            }));
            setModules(mapped);
            setSelectedModule(mapped[0]);
          } else {
          setSelectedModule(fallbackModules[0]);
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: progress } = await supabase
            .from('user_module_progress')
            .select('module_id')
            .eq('user_id', user.id);
          
          if (progress) {
            setCompletedModules(progress.map(p => p.module_id));
          }
        }
      } catch (err) {
        console.error('Error fetching modules:', err);
        setSelectedModule(fallbackModules[0]);
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };

    fetchModules();
    
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!selectedModule) return;

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    window.onYouTubeIframeAPIReady = () => {
      initPlayer();
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [selectedModule]);

  const initPlayer = () => {
    if (!selectedModule) return;
    if (playerRef.current) {
      playerRef.current.destroy();
    }

    playerRef.current = new window.YT.Player('youtube-player', {
      videoId: selectedModule.video_id,
      playerVars: {
        autoplay: 0,
        modestbranding: 1,
        rel: 0,
      },
      events: {
        onStateChange: (event: any) => {
          if (event.data === window.YT.PlayerState.ENDED) {
            setVideoFinished(true);
          }
        },
      },
    });
  };

  useEffect(() => {
    setVideoFinished(false);
  }, [selectedModule]);

  const handleStartQuiz = () => {
    setShowQuiz(true);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setQuizAnswers([]);
    setShowQuizResult(false);
    setQuizCompleted(false);
  };

  const handleAnswerSelect = (index: number) => {
    if (showQuizResult) return;
    setSelectedAnswer(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || !selectedModule) return;
    const isCorrect = selectedAnswer === selectedModule.quiz[currentQuestion].correctIndex;
    setQuizAnswers([...quizAnswers, isCorrect]);
    setShowQuizResult(true);
  };

  const handleNextQuestion = async () => {
    if (!selectedModule) return;
    
    if (currentQuestion < selectedModule.quiz.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowQuizResult(false);
    } else {
      setQuizCompleted(true);
      const correctCount = [...quizAnswers, selectedAnswer === selectedModule.quiz[currentQuestion].correctIndex].filter(Boolean).length;
      const passed = correctCount >= 2;
      
        if (passed && !completedModules.includes(selectedModule.id)) {
          setCompleting(true);
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            const { data: inserted, error: progressError } = await supabase.rpc('complete_module', {
              user_id_param: user.id,
              module_id_param: selectedModule.id,
              quiz_score_param: correctCount
            });

            if (!progressError && inserted) {
              await updateUserStats(selectedModule.points, 'module', selectedModule.title, 'completed');
              setCompletedModules(prev => [...prev, selectedModule.id]);
            }
          }
          setCompleting(false);
        }
    }
  };

  const handleCloseQuiz = () => {
    setShowQuiz(false);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setQuizAnswers([]);
    setShowQuizResult(false);
    setQuizCompleted(false);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner": return "text-[#00D084] bg-[#00D084]/10 border-[#00D084]/30";
      case "Intermediate": return "text-[#FFB800] bg-[#FFB800]/10 border-[#FFB800]/30";
      case "Advanced": return "text-[#FF4D4D] bg-[#FF4D4D]/10 border-[#FF4D4D]/30";
      default: return "text-[#B8BCCF]";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D1B2A] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#C0FF00] animate-spin" />
      </div>
    );
  }

  const correctAnswersCount = quizAnswers.filter(Boolean).length + (showQuizResult && selectedModule && selectedAnswer === selectedModule.quiz[currentQuestion]?.correctIndex ? 1 : 0);
  const quizPassed = quizCompleted && correctAnswersCount >= 2;

  return (
    <div className="min-h-screen bg-[#0D1B2A]">
      <HeaderNavigation />
      <main className="py-8 lg:py-12">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Learning Center</h1>
            <p className="text-[#B8BCCF]">Watch video tutorials and pass the quiz to earn points</p>
          </div>

          <div className="grid lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-[#1A2332] rounded-xl border border-[#2E3A4F] p-4 flex items-center gap-4">
              <div className="p-3 bg-[#C0FF00]/10 rounded-lg">
                <BookOpen className="w-6 h-6 text-[#C0FF00]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{modules.length}</p>
                <p className="text-sm text-[#B8BCCF]">Total Modules</p>
              </div>
            </div>
            <div className="bg-[#1A2332] rounded-xl border border-[#2E3A4F] p-4 flex items-center gap-4">
              <div className="p-3 bg-[#00D084]/10 rounded-lg">
                <CheckCircle className="w-6 h-6 text-[#00D084]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{completedModules.length}</p>
                <p className="text-sm text-[#B8BCCF]">Completed</p>
              </div>
            </div>
            <div className="bg-[#1A2332] rounded-xl border border-[#2E3A4F] p-4 flex items-center gap-4">
              <div className="p-3 bg-[#FFB800]/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-[#FFB800]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{Math.round((completedModules.length / modules.length) * 100)}%</p>
                <p className="text-sm text-[#B8BCCF]">Progress</p>
              </div>
            </div>
            <div className="bg-[#1A2332] rounded-xl border border-[#2E3A4F] p-4 flex items-center gap-4">
              <div className="p-3 bg-[#C0FF00]/10 rounded-lg">
                <Award className="w-6 h-6 text-[#C0FF00]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {completedModules.reduce<number>((acc, id) => acc + (modules.find(m => m.id === id)?.points || 0), 0)}
                </p>
                <p className="text-sm text-[#B8BCCF]">Points Earned</p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {selectedModule && (
                <div className="bg-[#1A2332] rounded-xl border border-[#2E3A4F] overflow-hidden">
                  {!showQuiz ? (
                    <>
                      <div className="aspect-video bg-black relative">
                        <div id="youtube-player" className="w-full h-full" />
                        
                        {videoFinished && !completedModules.includes(selectedModule.id) && (
                          <div className="absolute inset-0 bg-[#0D1B2A]/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
                            <div className="w-16 h-16 bg-[#C0FF00] rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(192,255,0,0.4)]">
                              <PlayCircle className="w-10 h-10 text-[#0D1B2A]" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Video Completed!</h3>
                            <p className="text-[#B8BCCF] mb-6 max-w-sm">
                              Ready to test your knowledge and earn points?
                            </p>
                            <button
                              onClick={handleStartQuiz}
                              className="px-8 py-3 bg-[#C0FF00] text-[#0D1B2A] font-bold rounded-lg hover:bg-[#b0e600] transition-all hover:scale-105 flex items-center gap-2 shadow-lg"
                            >
                              Start Module Quiz
                              <ArrowRight className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getLevelColor(selectedModule.level)}`}>
                            {selectedModule.level}
                          </span>
                          <span className="flex items-center gap-1 text-[#B8BCCF] text-sm">
                            <Clock className="w-4 h-4" />
                            {selectedModule.duration}
                          </span>
                          <span className="flex items-center gap-1 text-[#C0FF00] text-sm">
                            <Award className="w-4 h-4" />
                            +{selectedModule.points} pts
                          </span>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">{selectedModule.title}</h2>
                        <p className="text-[#B8BCCF] mb-6">{selectedModule.description}</p>
                        
                        {completedModules.includes(selectedModule.id) ? (
                          <div className="flex items-center gap-2 text-[#00D084] font-semibold bg-[#00D084]/10 p-4 rounded-lg border border-[#00D084]/30">
                            <Award className="w-5 h-5" />
                            Module Completed! +{selectedModule.points} points earned
                          </div>
                        ) : (
                          <button
                            onClick={handleStartQuiz}
                            className="px-6 py-3 bg-[#C0FF00] text-[#0D1B2A] font-bold rounded-lg hover:bg-[#b0e600] transition-all hover:scale-105 flex items-center gap-2"
                          >
                            Take Quiz to Complete
                            <ArrowRight className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white">Quiz: {selectedModule.title}</h2>
                        <button 
                          onClick={handleCloseQuiz}
                          className="text-[#B8BCCF] hover:text-white text-sm"
                        >
                          Close Quiz
                        </button>
                      </div>

                      {!quizCompleted ? (
                        <>
                          <div className="flex items-center gap-2 mb-6">
                            {selectedModule.quiz.map((_, idx) => (
                              <div 
                                key={idx}
                                className={`h-2 flex-1 rounded-full ${
                                  idx < currentQuestion ? (quizAnswers[idx] ? 'bg-[#00D084]' : 'bg-[#FF4D4D]') :
                                  idx === currentQuestion ? 'bg-[#C0FF00]' : 'bg-[#2E3A4F]'
                                }`}
                              />
                            ))}
                          </div>

                          <div className="mb-6">
                            <p className="text-[#B8BCCF] text-sm mb-2">Question {currentQuestion + 1} of {selectedModule.quiz.length}</p>
                            <h3 className="text-lg font-semibold text-white">{selectedModule.quiz[currentQuestion].question}</h3>
                          </div>

                          <div className="space-y-3 mb-6">
                            {selectedModule.quiz[currentQuestion].options.map((option, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleAnswerSelect(idx)}
                                disabled={showQuizResult}
                                className={`w-full p-4 rounded-lg border text-left transition-all ${
                                  showQuizResult
                                    ? idx === selectedModule.quiz[currentQuestion].correctIndex
                                      ? 'border-[#00D084] bg-[#00D084]/10'
                                      : idx === selectedAnswer
                                      ? 'border-[#FF4D4D] bg-[#FF4D4D]/10'
                                      : 'border-[#2E3A4F] bg-[#0D1B2A]/50'
                                    : selectedAnswer === idx
                                    ? 'border-[#C0FF00] bg-[#C0FF00]/10'
                                    : 'border-[#2E3A4F] bg-[#0D1B2A] hover:border-[#C0FF00]/50'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                    showQuizResult
                                      ? idx === selectedModule.quiz[currentQuestion].correctIndex
                                        ? 'border-[#00D084] bg-[#00D084]'
                                        : idx === selectedAnswer
                                        ? 'border-[#FF4D4D] bg-[#FF4D4D]'
                                        : 'border-[#2E3A4F]'
                                      : selectedAnswer === idx
                                      ? 'border-[#C0FF00] bg-[#C0FF00]'
                                      : 'border-[#2E3A4F]'
                                  }`}>
                                    {showQuizResult && idx === selectedModule.quiz[currentQuestion].correctIndex && (
                                      <CheckCircle className="w-4 h-4 text-white" />
                                    )}
                                    {showQuizResult && idx === selectedAnswer && idx !== selectedModule.quiz[currentQuestion].correctIndex && (
                                      <XCircle className="w-4 h-4 text-white" />
                                    )}
                                  </div>
                                  <span className={`text-sm ${
                                    showQuizResult
                                      ? idx === selectedModule.quiz[currentQuestion].correctIndex
                                        ? 'text-[#00D084]'
                                        : idx === selectedAnswer
                                        ? 'text-[#FF4D4D]'
                                        : 'text-[#B8BCCF]'
                                      : selectedAnswer === idx
                                      ? 'text-white'
                                      : 'text-[#B8BCCF]'
                                  }`}>
                                    {option}
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>

                          {!showQuizResult ? (
                            <button
                              onClick={handleSubmitAnswer}
                              disabled={selectedAnswer === null}
                              className="w-full px-6 py-3 bg-[#C0FF00] text-[#0D1B2A] font-bold rounded-lg hover:bg-[#b0e600] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Submit Answer
                            </button>
                          ) : (
                            <button
                              onClick={handleNextQuestion}
                              className="w-full px-6 py-3 bg-[#C0FF00] text-[#0D1B2A] font-bold rounded-lg hover:bg-[#b0e600] transition-all flex items-center justify-center gap-2"
                            >
                              {currentQuestion < selectedModule.quiz.length - 1 ? 'Next Question' : 'See Results'}
                              <ArrowRight className="w-5 h-5" />
                            </button>
                          )}
                        </>
                      ) : (
                        <div className="text-center py-8">
                          <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
                            quizPassed ? 'bg-[#00D084]/20' : 'bg-[#FF4D4D]/20'
                          }`}>
                            {quizPassed ? (
                              <CheckCircle className="w-10 h-10 text-[#00D084]" />
                            ) : (
                              <XCircle className="w-10 h-10 text-[#FF4D4D]" />
                            )}
                          </div>
                          <h3 className={`text-2xl font-bold mb-2 ${quizPassed ? 'text-[#00D084]' : 'text-[#FF4D4D]'}`}>
                            {quizPassed ? 'Quiz Passed!' : 'Quiz Not Passed'}
                          </h3>
                          <p className="text-[#B8BCCF] mb-4">
                            You got {correctAnswersCount} out of {selectedModule.quiz.length} questions correct
                          </p>
                          {quizPassed ? (
                            <div className="flex items-center justify-center gap-2 text-[#C0FF00] font-bold mb-6">
                              <Award className="w-5 h-5" />
                              +{selectedModule.points} points earned!
                            </div>
                          ) : (
                            <p className="text-[#B8BCCF] text-sm mb-6">
                              You need at least 2 correct answers to pass. Watch the video again and retry!
                            </p>
                          )}
                          <button
                            onClick={handleCloseQuiz}
                            className="px-6 py-3 bg-[#C0FF00] text-[#0D1B2A] font-bold rounded-lg hover:bg-[#b0e600] transition-all"
                          >
                            {quizPassed ? 'Continue Learning' : 'Try Again'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">All Modules</h3>
                {modules.map((module) => (
                  <button
                    key={module.id}
                    onClick={() => {
                      setSelectedModule(module);
                      handleCloseQuiz();
                    }}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      selectedModule?.id === module.id
                        ? "bg-[#1A2332] border-[#C0FF00]"
                        : completedModules.includes(module.id)
                        ? "bg-[#1A2332]/50 border-[#00D084]/50"
                        : "bg-[#1A2332]/50 border-[#2E3A4F] hover:border-[#C0FF00]/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {completedModules.includes(module.id) ? (
                            <CheckCircle className="w-4 h-4 text-[#00D084]" />
                          ) : (
                            <Play className="w-4 h-4 text-[#C0FF00]" />
                          )}
                          <span className={`text-xs font-medium ${getLevelColor(module.level).split(' ')[0]}`}>
                            {module.level}
                          </span>
                          {completedModules.includes(module.id) && (
                            <span className="text-xs font-medium text-[#00D084] bg-[#00D084]/10 px-2 py-0.5 rounded-full">
                              Completed
                            </span>
                          )}
                        </div>
                        <h4 className="text-white font-medium text-sm mb-1">{module.title}</h4>
                        <div className="flex items-center gap-3 text-xs text-[#B8BCCF]">
                          <span>{module.duration}</span>
                          <span>+{module.points} pts</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[#B8BCCF]" />
                    </div>
                  </button>
                ))}
              
              <div className="mt-6 p-4 bg-[#1A2332] rounded-xl border border-[#2E3A4F]">
                <h4 className="text-white font-semibold mb-2">Your Progress</h4>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-[#B8BCCF]">Modules completed</span>
                  <span className="text-[#C0FF00] font-bold">{completedModules.length}/{modules.length}</span>
                </div>
                <div className="h-2 bg-[#0D1B2A] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#C0FF00] rounded-full transition-all"
                    style={{ width: `${(completedModules.length / modules.length) * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-4 bg-[#1A2332] rounded-xl border border-[#2E3A4F]">
                <h4 className="text-white font-semibold mb-3">Continue Learning</h4>
                <div className="space-y-2">
                  <Link href="/simulations" className="flex items-center justify-between p-3 bg-[#0D1B2A] rounded-lg hover:bg-[#2E3A4F] transition-colors">
                    <span className="text-[#B8BCCF] text-sm">Practice Simulations</span>
                    <ChevronRight className="w-4 h-4 text-[#B8BCCF]" />
                  </Link>
                  <Link href="/daily-challenge" className="flex items-center justify-between p-3 bg-[#0D1B2A] rounded-lg hover:bg-[#2E3A4F] transition-colors">
                    <span className="text-[#B8BCCF] text-sm">Daily Challenge</span>
                    <ChevronRight className="w-4 h-4 text-[#B8BCCF]" />
                  </Link>
                  <Link href="/discussions" className="flex items-center justify-between p-3 bg-[#0D1B2A] rounded-lg hover:bg-[#2E3A4F] transition-colors">
                    <span className="text-[#B8BCCF] text-sm">Join Discussions</span>
                    <ChevronRight className="w-4 h-4 text-[#B8BCCF]" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
