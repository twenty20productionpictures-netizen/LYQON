import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-ai",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-border bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // LYQON-specific variants
        hero: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-ai hover:shadow-glow-ai transform hover:scale-105 transition-spring text-base font-semibold",
        accent: "bg-accent text-accent-foreground hover:bg-accent/90 shadow-accent hover:shadow-glow-accent transform hover:scale-105 transition-spring text-base font-semibold",
        ai: "bg-gradient-ai text-foreground hover:opacity-90 shadow-ai hover:shadow-glow-ai transform hover:scale-105 transition-spring",
        dashboard: "bg-card/50 border border-border text-foreground hover:bg-card/80 backdrop-blur-sm",
        premium: "bg-gradient-accent text-foreground hover:opacity-90 shadow-accent hover:shadow-glow-accent transform hover:scale-105 transition-spring font-semibold",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-14 rounded-lg px-12 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);