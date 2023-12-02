export default {
  ".nui-animate-fade-enter": {
    animation: "nuiFadeIn 0.4s cubic-bezier(0.165, 0.84, 0.44, 1) forwards"
  },
  ".nui-animate-fade-leave": {
    animation: "nuiFadeOut 0.4s cubic-bezier(0.165, 0.84, 0.44, 1) forwards"
  },
  "@keyframes nuiFadeIn": { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
  "@keyframes nuiFadeOut": { "0%": { opacity: 1 }, "100%": { opacity: 0 } },
  ".nui-animate-scale-enter": {
    transformOrigin: "top left",
    animation: "nuiScaleEnter 300ms ease-in-out forwards"
  },
  ".nui-animate-scale-leave": {
    transformOrigin: "top left",
    animation: "nuiScaleLeave 300ms ease-in-out forwards"
  },
  "@keyframes nuiScaleEnter": {
    "0%": { opacity: 0, transform: "scale(0)" },
    "80%": { transform: "scale(1.07)" },
    "100%": { opacity: 1, transform: "scale(1)" }
  },
  "@keyframes nuiScaleLeave": {
    "0%": { opacity: 1, transform: "scale(1)" },
    "100%": { opacity: 0, transform: "scale(0)" }
  }
}
