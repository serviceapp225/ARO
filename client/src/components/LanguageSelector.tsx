import { useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

const languages: Language[] = [
  { code: "tj", name: "Tajik", nativeName: "Тоҷики" },
  { code: "ru", name: "Russian", nativeName: "Русский" },
];

export default function LanguageSelector() {
  const [, setLocation] = useLocation();
  const [selectedLanguage, setSelectedLanguage] = useState("ru"); // По умолчанию русский

  const handleLanguageSelect = (langCode: string) => {
    setSelectedLanguage(langCode);
    // Здесь можно добавить логику сохранения языка в localStorage
    localStorage.setItem("selectedLanguage", langCode);
    
    // Возвращаемся в профиль через небольшую задержку
    setTimeout(() => {
      setLocation("/profile");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/profile")}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Назад
          </Button>
          <h1 className="text-xl font-bold text-gray-900">Выбор языка</h1>
          <div className="w-16"></div> {/* Spacer for centering */}
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm">
            {languages.map((language, index) => (
              <button
                key={language.code}
                onClick={() => handleLanguageSelect(language.code)}
                className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
                  index === 0 ? 'rounded-t-2xl' : ''
                } ${index === languages.length - 1 ? 'rounded-b-2xl' : 'border-b border-gray-100'}`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-left">
                    <div className="font-medium text-gray-900 text-lg">
                      {language.nativeName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {language.name}
                    </div>
                  </div>
                </div>
                {selectedLanguage === language.code && (
                  <Check className="w-5 h-5 text-blue-600" />
                )}
              </button>
            ))}
          </div>


        </div>
      </main>
    </div>
  );
}