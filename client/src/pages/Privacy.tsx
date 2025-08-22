import { ArrowLeft, Shield, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function Privacy() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 main-content">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/profile")}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Назад
          </Button>
          <div className="w-16"></div>
          <div className="w-16"></div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* PDF Viewer Container */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-green-600" />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Политика конфиденциальности
                    </h2>
                    <p className="text-sm text-gray-500">
                      Информация о защите персональных данных пользователей
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Privacy Policy Content */}
            <div className="p-6">
              <div className="prose prose-gray max-w-none">
                
                {/* Date */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium">
                    Дата вступления в силу: 14 января 2025 г.
                  </p>
                </div>

                {/* Introduction */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Введение</h2>
                  <p className="text-gray-700 leading-relaxed">
                    Настоящая Политика конфиденциальности регулирует порядок сбора, использования и защиты персональных данных пользователей сайта Narxi Tu (далее — «Сайт»). Мы уважаем ваше право на конфиденциальность и стремимся обеспечить безопасность вашей информации.
                  </p>
                </div>

                {/* Section 1 */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">1. Сбор информации</h3>
                  <p className="text-gray-700 mb-3">Мы можем собирать следующие данные:</p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Персональные данные: имя, контактный телефон, адрес электронной почты, адрес проживания;</li>
                    <li>Информация о транспортных средствах, которые вы покупаете или продаёте;</li>
                    <li>Платёжная информация (обрабатывается через защищённые сторонние платёжные сервисы);</li>
                    <li>IP-адрес, геолокация, данные о вашем устройстве и активности на Сайте.</li>
                  </ul>
                </div>

                {/* Section 2 */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">2. Использование данных</h3>
                  <p className="text-gray-700 mb-3">Собранные данные используются исключительно для следующих целей:</p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Обеспечение функционирования аукциона и обработки сделок;</li>
                    <li>Предоставление технической поддержки и обратной связи;</li>
                    <li>Улучшение работы Сайта и персонализация пользовательского опыта;</li>
                    <li>Выполнение юридических и налоговых требований.</li>
                  </ul>
                </div>

                {/* Section 3 */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">3. Передача информации третьим лицам</h3>
                  <p className="text-gray-700 mb-3">Мы не продаём и не передаём ваши персональные данные третьим лицам, за исключением:</p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Законных требований от государственных органов;</li>
                    <li>Надёжных партнёров (например, платёжных провайдеров), при условии обеспечения конфиденциальности;</li>
                    <li>В рамках слияния или передачи прав собственности на бизнес.</li>
                  </ul>
                </div>

                {/* Section 4 */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">4. Хранение и защита данных</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Мы применяем современные технические и организационные меры защиты, включая шифрование и ограничение доступа. Персональные данные хранятся только в течение необходимого срока для достижения целей, указанных в настоящей политике.
                  </p>
                </div>

                {/* Section 5 */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">5. Права пользователя</h3>
                  <p className="text-gray-700 mb-3">Вы имеете право:</p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Запрашивать доступ к своим данным;</li>
                    <li>Требовать их изменения или удаления;</li>
                    <li>Отозвать согласие на обработку данных (в некоторых случаях это может повлиять на использование Сайта).</li>
                  </ul>
                </div>

                {/* Section 6 */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">6. Изменения политики</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Мы оставляем за собой право вносить изменения в данную Политику. Обновления публикуются на этой странице с указанием даты вступления в силу.
                  </p>
                </div>

                {/* Legal Version Header */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <div className="mb-6 p-4 bg-amber-50 rounded-lg">
                    <h2 className="text-xl font-bold text-amber-900 mb-2">Юридическая версия</h2>
                    <p className="text-sm text-amber-800">
                      Подробная юридическая версия политики конфиденциальности
                    </p>
                  </div>
                </div>

                {/* Legal Section 1 */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">1. Общие положения</h3>
                  <p className="text-gray-700 mb-3">
                    <strong>1.1.</strong> Настоящая Политика составлена в соответствии с требованиями действующего законодательства о защите персональных данных и определяет порядок обработки персональных данных, а также меры по обеспечению их безопасности.
                  </p>
                  <p className="text-gray-700">
                    <strong>1.2.</strong> Оператором персональных данных является владелец Сайта — Narxi Tu, далее — «Оператор».
                  </p>
                </div>

                {/* Legal Section 2 */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">2. Состав обрабатываемых данных</h3>
                  <p className="text-gray-700 mb-3">
                    <strong>2.1.</strong> Оператор осуществляет обработку следующих категорий персональных данных:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Фамилия, имя, отчество;</li>
                    <li>Контактные данные (номер телефона, адрес электронной почты, адрес проживания);</li>
                    <li>Информация о транспортных средствах, подлежащих продаже или покупке;</li>
                    <li>Платёжная информация (в случае осуществления транзакций);</li>
                    <li>Техническая информация (IP-адрес, cookies, тип устройства, история посещений и т.д.).</li>
                  </ul>
                  <p className="text-gray-700 mt-3">
                    <strong>2.2.</strong> Персональные данные предоставляются Пользователем добровольно посредством заполнения регистрационных форм, участия в аукционах или при взаимодействии с Сайтом.
                  </p>
                </div>

                {/* Legal Section 3 */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">3. Цели обработки персональных данных</h3>
                  <p className="text-gray-700 mb-3">
                    <strong>3.1.</strong> Оператор осуществляет обработку персональных данных в следующих целях:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Идентификация Пользователя в рамках оказания услуг;</li>
                    <li>Обеспечение функционирования платформы аукциона;</li>
                    <li>Обработка заявок, заказов и транзакций;</li>
                    <li>Обратная связь с Пользователем, включая направления уведомлений и запросов;</li>
                    <li>Исполнение требований законодательства.</li>
                  </ul>
                </div>

                {/* Legal Section 4 */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">4. Правовые основания обработки</h3>
                  <p className="text-gray-700">
                    <strong>4.1.</strong> Обработка персональных данных осуществляется на основании:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-3">
                    <li>Согласия субъекта персональных данных;</li>
                    <li>Необходимости исполнения договора, стороной которого является субъект данных;</li>
                    <li>Обязанности, возложенной на Оператора в соответствии с законом.</li>
                  </ul>
                </div>

                {/* Legal Section 5 */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">5. Условия передачи персональных данных третьим лицам</h3>
                  <p className="text-gray-700 mb-3">
                    <strong>5.1.</strong> Оператор вправе передавать персональные данные третьим лицам исключительно в следующих случаях:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>При наличии письменного согласия субъекта персональных данных;</li>
                    <li>В рамках исполнения обязательств перед платёжными и иными сервисными провайдерами;</li>
                    <li>По запросу уполномоченных органов государственной власти на основании закона;</li>
                    <li>В случае реорганизации или смены собственника Сайта при соблюдении условий конфиденциальности.</li>
                  </ul>
                </div>

                {/* Legal Section 6 */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">6. Меры по обеспечению безопасности данных</h3>
                  <p className="text-gray-700">
                    <strong>6.1.</strong> Оператор принимает все необходимые организационные и технические меры для защиты персональных данных от несанкционированного или случайного доступа, уничтожения, изменения, блокирования, копирования, распространения, а также иных неправомерных действий.
                  </p>
                </div>

                {/* Legal Section 7 */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">7. Сроки хранения персональных данных</h3>
                  <p className="text-gray-700">
                    <strong>7.1.</strong> Персональные данные хранятся в течение срока, необходимого для достижения целей обработки, либо до момента отзыва согласия Пользователем, если иное не предусмотрено действующим законодательством.
                  </p>
                </div>

                {/* Legal Section 8 */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">8. Права субъекта персональных данных</h3>
                  <p className="text-gray-700 mb-3">Пользователь вправе:</p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Требовать уточнения своих персональных данных, их обновления, блокирования или уничтожения;</li>
                    <li>Отозвать своё согласие на обработку персональных данных;</li>
                    <li>Получать информацию о своих персональных данных и порядке их обработки.</li>
                  </ul>
                </div>

                {/* Legal Section 9 */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">9. Изменения Политики</h3>
                  <p className="text-gray-700">
                    <strong>9.1.</strong> Оператор оставляет за собой право вносить изменения в настоящую Политику. Актуальная версия всегда доступна на Сайте. Изменения вступают в силу с момента публикации.
                  </p>
                </div>

                {/* Contact Information */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Контактная информация</h3>
                    <p className="text-gray-700">
                      По вопросам обработки персональных данных и защиты конфиденциальности обращайтесь к администрации сайта Narxi Tu.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>


        </div>
      </main>
    </div>
  );
}