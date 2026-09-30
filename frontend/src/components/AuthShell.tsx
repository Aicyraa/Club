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
      <div className="grid min-h-screen bg-muted lg:grid-cols-[minmax(0,1.15fr)_minmax(28rem,0.85fr)]">
         <aside className="bg-primary text-primary-foreground relative hidden overflow-hidden border-r lg:flex lg:flex-col lg:justify-between">
            {/* Soft radial wash behind the content. */}
            <div
               aria-hidden="true"
               className="pointer-events-none absolute inset-0 opacity-25"
               style={{
                  backgroundImage:
                     'radial-gradient(circle at 20% 20%, currentColor 0%, transparent 45%), radial-gradient(circle at 80% 75%, currentColor 0%, transparent 40%)',
               }}
            />

            <div className="relative flex items-center gap-2 p-10 xl:p-14">
               <div className="bg-primary-foreground text-primary grid size-9 place-items-center rounded-full">
                  <Club />
               </div>
               <span className="text-base font-semibold tracking-tight">The Club</span>
            </div>

            <div className="relative flex flex-col gap-10 p-10 xl:p-14">
               <div className="flex flex-col gap-4">
                  <p className="text-xs font-semibold tracking-widest uppercase">Invitation only, by design</p>
                  <h2 className="max-w-2xl text-5xl leading-[0.95] font-semibold tracking-[-0.05em] text-balance xl:text-7xl">
                     A smaller room makes space for bigger ideas.
                  </h2>
                  <p className="text-primary-foreground/70 max-w-lg text-base leading-relaxed">
                     One thoughtful feed, three levels of trust. Start private, become a
                     member, and help shape the conversation.
                  </p>
               </div>

               <ul className="grid gap-4 xl:grid-cols-3">
                  {HIGHLIGHTS.map(({ icon: Icon, title, body }) => (
                     <li key={title} className="border-primary-foreground/20 flex flex-col gap-3 border-t pt-4">
                        <div className="bg-primary-foreground/10 grid size-9 shrink-0 place-items-center rounded-full">
                           <Icon />
                        </div>
                        <div className="flex flex-col gap-1">
                           <p className="text-sm font-medium">{title}</p>
                           <p className="text-primary-foreground/60 text-sm">{body}</p>
                        </div>
                     </li>
                  ))}
               </ul>
            </div>

            <p className="text-primary-foreground/50 relative p-10 text-xs xl:p-14">
               Private by default. Useful by choice.
            </p>
         </aside>

         <main className="flex items-center justify-center bg-background p-6 sm:p-10">
            <div className="w-full max-w-sm">{children}</div>
         </main>
      </div>
   )
}

export default AuthShell
