import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { AutoResizeTextarea } from '@/components/ui/AutoResizeTextarea';
import { Button } from '@/components/ui/dads/Button';
import { ErrorText } from '@/components/ui/dads/ErrorText';
import { SupportText } from '@/components/ui/dads/SupportText';
import { SendIcon } from '@/components/ui/icons/SendIcon';
import { ModelSelector } from '@/features/chat/components/ModelSelector';
import { TOP_CHAT_SYSTEM_PROMPT } from '@/features/landing/constants';
import { type LandingChatFormSchema, landingChatFormSchema } from '@/features/landing/schema';
import { isSubmitKey } from '@/utils/keyboard';

/**
 * トップページの直接チャット入力フォーム。送信するとチャット画面へ遷移し自動送信する。
 * ChatPage 側の useSetDefaultValues が location.state（content / systemContext / autoSubmit）を消費する。
 * TOP_CHAT_SYSTEM_PROMPT が空のときは LandingPage 側で本フォームを描画しない（オプトイン）。
 */
export const LandingForm = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LandingChatFormSchema>({
    resolver: zodResolver(landingChatFormSchema),
  });

  const onSubmit = handleSubmit((data) => {
    navigate('/chat', {
      state: {
        content: data.chatInput,
        systemContext: TOP_CHAT_SYSTEM_PROMPT,
        autoSubmit: true,
      },
    });
  });

  return (
    <div className='mt-8 lg:mt-10'>
      <h2 id='landing-chat-input-heading' className='mb-2 text-std-20B-160'>
        お手伝いできることはありますか？お気軽にご相談ください
        <span className='text-std-16N-170'>（送信したらチャット画面に遷移します）</span>
      </h2>
      <form onSubmit={onSubmit}>
        <div className='flex flex-col gap-4'>
          <SupportText id='chat-input-support'>
            例）"資料を要約したい"、"アイデアを整理したい"、"適切なプロンプトを考えてほしい"
          </SupportText>
          <div className='flex items-center gap-4 lg:gap-6'>
            <ModelSelector />
          </div>
          <AutoResizeTextarea
            id='chat-input'
            aria-labelledby='landing-chat-input-heading'
            aria-describedby={
              errors.chatInput ? 'chat-input-support chat-input-error' : 'chat-input-support'
            }
            aria-invalid={errors.chatInput ? true : undefined}
            required
            rows={3}
            onKeyDown={(e) => {
              if (isSubmitKey(e)) {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
            {...register('chatInput')}
          />

          <div className='flex justify-end'>
            {errors.chatInput && (
              <ErrorText className='mr-auto -mt-1' id='chat-input-error'>
                ＊{errors.chatInput.message}
              </ErrorText>
            )}
            <Button
              type='submit'
              size='md'
              variant='solid-fill'
              className='inline-flex justify-center items-center gap-1'
            >
              <SendIcon aria-hidden={true} className='shrink-0' />
              送信
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
