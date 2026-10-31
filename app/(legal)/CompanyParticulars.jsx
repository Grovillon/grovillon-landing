import { COMPANY } from './site';

// The particulars a UK company's website must show: registered name, where
// it is registered, its number and its registered office, plus how to reach us.
export default function CompanyParticulars() {
  return (
    <dl className="legal-dl">
      <div>
        <dt>Company name</dt>
        <dd>{COMPANY.name}</dd>
      </div>
      <div>
        <dt>Registered in</dt>
        <dd>{COMPANY.jurisdiction}</dd>
      </div>
      <div>
        <dt>Company number</dt>
        <dd>{COMPANY.number}</dd>
      </div>
      <div>
        <dt>Registered office</dt>
        <dd>
          <address>
            {COMPANY.office.map((line, index) => (
              <span key={line} className="block">
                {line}
                {index < COMPANY.office.length - 1 ? <span className="sr-only">,</span> : null}
              </span>
            ))}
          </address>
        </dd>
      </div>
      <div>
        <dt>Email</dt>
        <dd>
          <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
        </dd>
      </div>
    </dl>
  );
}
