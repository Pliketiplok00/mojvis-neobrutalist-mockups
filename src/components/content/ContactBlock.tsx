import { Phone, Mail, Clock, MapPin, Building2 } from "lucide-react";

interface ContactItem {
  id: string;
  name: string;
  address?: string;
  phones?: string[];
  email?: string;
  workingHours?: string | { days: string; hours: string }[];
  note?: string;
}

interface ContactBlockProps {
  title?: string;
  contacts: ContactItem[];
}

export function ContactBlock({ title, contacts }: ContactBlockProps) {
  return (
    <section className="border-b-4 border-foreground p-5">
      {title && (
        <h2 className="mb-4 font-display text-lg font-bold uppercase tracking-tight">
          {title}
        </h2>
      )}
      <div className="space-y-4">
        {contacts.map((contact) => (
          <div 
            key={contact.id}
            className="border-3 border-foreground bg-background p-4"
            style={{ borderWidth: "3px" }}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-foreground bg-accent">
                <Building2 className="h-5 w-5" strokeWidth={2.5} />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-display text-sm font-bold uppercase">{contact.name}</h3>
                
                {contact.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" strokeWidth={2.5} />
                    <span className="font-body text-xs text-muted-foreground">{contact.address}</span>
                  </div>
                )}
                
                {contact.phones && contact.phones.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {contact.phones.map((phone, i) => (
                      <a
                        key={i}
                        href={`tel:${phone.replace(/\s/g, "")}`}
                        className="inline-flex items-center gap-1 border-2 border-foreground bg-secondary px-2 py-1 font-body text-xs transition-colors hover:bg-secondary/80"
                      >
                        <Phone className="h-3 w-3" strokeWidth={2.5} />
                        {phone}
                      </a>
                    ))}
                  </div>
                )}
                
                {contact.email && (
                  <a
                    href={`mailto:${contact.email}`}
                    className="inline-flex items-center gap-1 font-body text-xs text-primary underline-offset-2 hover:underline"
                  >
                    <Mail className="h-3 w-3" strokeWidth={2.5} />
                    {contact.email}
                  </a>
                )}
                
                {contact.workingHours && (
                  <div className="flex items-start gap-2">
                    <Clock className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" strokeWidth={2.5} />
                    {typeof contact.workingHours === "string" ? (
                      <span className="font-body text-xs text-muted-foreground">{contact.workingHours}</span>
                    ) : (
                      <div className="space-y-0.5">
                        {contact.workingHours.map((wh, i) => (
                          <p key={i} className="font-body text-xs text-muted-foreground">
                            <span className="font-semibold">{wh.days}:</span> {wh.hours}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {contact.note && (
                  <p className="font-body text-xs italic text-muted-foreground">{contact.note}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
