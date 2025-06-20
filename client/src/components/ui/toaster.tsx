import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        // Скрываем кнопку закрытия для уведомлений о поисковых запросах
        const hideCloseButton = title === "Поисковый запрос сохранён" || title === "Поисковый запрос удален"
        
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            {!hideCloseButton && <ToastClose />}
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
