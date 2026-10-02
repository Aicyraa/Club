import type { ReactNode } from 'react'
import { Club, EyeOff, ShieldCheck, Sparkles } from 'lucide-react'

const HIGHLIGHTS = [
   {
      icon: EyeOff,
      title: 'Post anonymously',
      body: 'Every post can be published without your name attached.',
   },
   {
      icon: Sparkles,
      title: 'Unlock the authors',
      body: 'Redeem a code as a member to see who wrote each message.',
   },
   {
      icon: ShieldCheck,
      title: 'Admins keep it tidy',
      body: 'Administrators can remove anything that does not belong.',
   },
]

/**
 * Two-column auth layout: an art-directed brand panel on the left, the form on
 * the right. The brand panel is decorative, so it is hidden from assistive
 * technology and dropped entirely on small screens where it would just push the
 * form below the fold.
 */
export const AuthShell = ({ children }: { children: ReactNode }) => {
   return (
      <div className="min-h-screen bg-muted lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(28rem,0.85fr)]">
         <aside className="bg-primary text-primary-foreground relative flex flex-col gap-10 overflow-hidden px-6 py-7 sm:px-10 lg:min-h-screen lg:justify-between lg:border-r lg:px-12 lg:py-10 xl:p-14">
            {/* Soft radial wash behind the content. */}
            <div
               aria-hidden="true"
               className="pointer-events-none absolute inset-0 opacity-25"
               style={{
                  backgroundImage:
                     'radial-gradient(circle at 20% 20%, currentColor 0%, transparent 45%), radial-gradient(circle at 80% 75%, currentColor 0%, transparent 40%)',
               }}
            />

            <div className="relative flex items-center gap-2">
               <div className="bg-primary-foreground text-primary grid size-9 place-items-center rounded-full">
                  <Club />
               </div>
               <span className="text-base font-semibold tracking-tight">The Club</span>
            </div>

            <div className="relative flex flex-col gap-8 lg:my-auto lg:gap-10">
               <div className="flex flex-col gap-4">
                  <p className="text-xs font-semibold tracking-widest uppercase">A thoughtful corner of the internet</p>
                  <h2 className="max-w-2xl text-4xl leading-[0.98] font-semibold tracking-[-0.05em] text-balance sm:text-5xl lg:text-6xl xl:text-7xl">
                     A smaller room makes space for bigger ideas.
                  </h2>
                  <p className="text-primary-foreground/75 max-w-lg text-sm leading-relaxed sm:text-base">
                     One thoughtful feed, three levels of trust. Start private, become a
                     member, and help shape the conversation.
                  </p>
               </div>

               <ul className="hidden gap-4 lg:grid lg:grid-cols-3">
                  {HIGHLIGHTS.map(({ icon: Icon, title, body }) => (
                     <li key={title} className="border-primary-foreground/25 flex flex-col gap-3 border-t pt-4">
                        <div className="bg-primary-foreground/10 grid size-9 shrink-0 place-items-center rounded-full">
                           <Icon className="size-4" />
                        </div>
                        <div className="flex flex-col gap-1">
                           <p className="text-sm font-medium">{title}</p>
                           <p className="text-primary-foreground/60 text-sm">{body}</p>
                        </div>
                     </li>
                  ))}
               </ul>
            </div>

            <p className="text-primary-foreground/60 relative hidden text-xs lg:block">
               Private by default. Useful by choice.
            </p>
         </aside>

         <main className="flex min-h-screen items-start justify-center bg-background p-4 sm:p-8 lg:items-center lg:p-12">
            <div className="w-full max-w-md">{children}</div>
         </main>
      </div>
   )
}

export default AuthShell
