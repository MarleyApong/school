import * as RemixIcons from "react-icons/ri"
import * as PhosphorIcons from "react-icons/pi"

export const ItemsAdmin = [
   {
      Icon: <RemixIcons.RiHomeLine/>,
      Display: "Tableau de bord",
      Link: "/admin/"
   },
   {
      Icon: <PhosphorIcons.PiChalkboardTeacherDuotone/>,
      Display: "Professeur",
      Link: "/admin/professeurs"
   },
   {
      Icon: <RemixIcons.RiUser6Line/>,
      Display: "Etudiant",
      Link: "/admin/etudiants"
   },
   {
      Icon: <RemixIcons.RiQrScanLine/>,
      Display: "Pointage",
      Link: "/admin/pointage",
      subNav: [
         {
            Icon: <PhosphorIcons.PiChalkboardTeacherDuotone/>,
            Display: "Pointage prof.",
            Link: "/admin/pointage/professeurs",
         },
         {
            Icon: <RemixIcons.RiUser6Line/>,
            Display: "Pointage etud.",
            Link: "/admin/pointage/etudiants",
         }
      ]
   },
   {
      Icon: <RemixIcons.RiContactsBookLine/>,
      Display: "Vérification",
      Link: "/admin/verification",
   },
   {
      Icon: <RemixIcons.RiSecurePaymentLine/>,
      Display: "Users",
      Link: "/admin/users",
   }
]
