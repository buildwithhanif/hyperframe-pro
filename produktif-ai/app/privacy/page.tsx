import type { Metadata } from "next";
import LegalPage from "@/components/site/LegalPage";
import "../tokens.css";
import "../legal.css";

export const metadata: Metadata = {
  title: "Privacy policy | produktif.ai",
  description: "What produktif.ai collects when you apply or become a client, and how we handle your face and voice.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      updated="11 October 2026"
      intro={
        <>
          <p>
            This page explains what we collect when you apply to produktif.ai or become a client, and what we do with it. The short version:
            we use your details to run the waitlist and to make your videos. We never sell them or use them for ads.
          </p>
          <p>
            This is a plain-language draft that will be reviewed by an Indonesian lawyer. If you&rsquo;re a client, your signed service
            agreement governs.
          </p>
        </>
      }
      sections={[
        {
          id: "who-we-are",
          heading: "Who we are",
          body: (
            <>
              <p>
                produktif.ai is a done-for-you AI video service based in Yogyakarta, Indonesia. It is run by Hanif Produktif. When this
                policy says &ldquo;we&rdquo; or &ldquo;us&rdquo;, it means produktif.ai.
              </p>
              <p>
                We are setting up a PT Perorangan (an Indonesian single-founder company) to run the service. The legal entity&rsquo;s
                details will be added here once it is registered.
              </p>
              <p>
                For anything about your data, email <a href="mailto:privacy@produktif.ai">privacy@produktif.ai</a>.
              </p>
            </>
          ),
        },
        {
          id: "what-we-collect",
          heading: "What we collect",
          body: (
            <>
              <p>
                It depends on how far you go with us. Joining the waitlist takes a few details. Becoming a client takes much more. Your face
                and voice are part of that, so we only ask for them after you&rsquo;ve paid the deposit and signed the agreement.
              </p>
              <table>
                <thead>
                  <tr>
                    <th scope="col">What we collect</th>
                    <th scope="col">Why</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="colgroup" colSpan={2}>
                      If you join the waitlist
                    </th>
                  </tr>
                  <tr>
                    <td>Name and email</td>
                    <td>To reply to your application and send your confirmation email</td>
                  </tr>
                  <tr>
                    <td>WhatsApp number (optional)</td>
                    <td>To message you about your application, if you&rsquo;d rather use WhatsApp</td>
                  </tr>
                  <tr>
                    <td>The consent sentence you agreed to, and the time you ticked the box</td>
                    <td>To keep a record that you agreed</td>
                  </tr>
                  <tr>
                    <td>
                      Your creator profile: niche, main platform and handle, audience size, how often you post, your goal, video language,
                      when you want to start, and whether the price fits your budget
                    </td>
                    <td>To pick the right people for each cohort</td>
                  </tr>
                  <tr>
                    <td>Campaign tags in the link you clicked (UTM tags)</td>
                    <td>To see which posts bring people to the site</td>
                  </tr>
                  <tr>
                    <th scope="colgroup" colSpan={2}>
                      If you become a client (after the deposit and the signed agreement)
                    </th>
                  </tr>
                  <tr>
                    <td>Three photos of your face</td>
                    <td>To build your persona&rsquo;s face</td>
                  </tr>
                  <tr>
                    <td>A 2-minute voice recording that ends with a spoken consent line</td>
                    <td>To build your persona&rsquo;s voice, and to record your consent in your own voice</td>
                  </tr>
                  <tr>
                    <td>Your ID (KTP or passport) and a live selfie</td>
                    <td>
                      To check you are the person signing and that you&rsquo;re 18 or older. We delete the ID image right after the match
                      and keep only a log that the check passed.
                    </td>
                  </tr>
                  <tr>
                    <td>Scripts, briefs and the recording of your onboarding call</td>
                    <td>To plan and write your videos</td>
                  </tr>
                  <tr>
                    <td>The videos we make for you</td>
                    <td>To deliver them to you for review and posting</td>
                  </tr>
                  <tr>
                    <td>Invoices and payment records</td>
                    <td>For billing and tax records</td>
                  </tr>
                </tbody>
              </table>
              <p>
                <b>When the form saves.</b> Your name, email, WhatsApp number and consent reach us as soon as you finish the contact part of
                the form. The profile answers reach us when you answer the last question. If you stop halfway, we still have your contact
                details.
              </p>
              <p>
                <b>IP addresses.</b> When you send the form, our server briefly uses your IP address to block spam and repeated attempts. It
                is not saved with your application.
              </p>
              <p>
                <b>Passwords.</b> We will never ask for your social media passwords. You post every video yourself.
              </p>
            </>
          ),
        },
        {
          id: "why",
          heading: "How we use it",
          body: (
            <>
              <p>Waitlist details let us:</p>
              <ul>
                <li>reply to your application and send a confirmation email</li>
                <li>choose clients for each cohort based on fit</li>
                <li>send a short monthly update while you&rsquo;re still on the waitlist</li>
                <li>see which posts and links bring people here (that is what the campaign tags are for)</li>
              </ul>
              <p>
                Your answers on budget, start date, audience size and posting habits add up to a rough fit score. Its one job is to help us
                decide which applications to read first. A person reads every application and makes every choice.
              </p>
              <p>
                To stop the monthly update, reply to any update or email <a href="mailto:hello@produktif.ai">hello@produktif.ai</a>. Joining
                the waitlist is free and doesn&rsquo;t commit you to buy anything.
              </p>
              <p>
                Client materials let us build your own AI persona (made from your photos and recording) and make your videos with it. We use
                them for your account only, never for another client.
              </p>
              <p>
                You own your videos and your likeness. We get a license to use them only to produce your videos. Your videos appear in
                public as samples only if you give separate permission for that.
              </p>
            </>
          ),
        },
        {
          id: "legal-basis",
          heading: "Why we're allowed to use it",
          body: (
            <>
              <p>Your consent is the main reason.</p>
              <p>
                <b>Waitlist.</b> Before you can send the form, you tick a box that says: &ldquo;I agree to the privacy policy and to be
                contacted about produktif.ai by email or WhatsApp.&rdquo; We save that exact sentence with the date and time you ticked it.
              </p>
              <p>
                <b>Clients.</b> Indonesia&rsquo;s Personal Data Protection Law (UU PDP, Law No. 27 of 2022) treats biometric data, such as
                your face and voice, as specific personal data. Using it needs your explicit consent. So before we touch your photos or
                voice, you sign a written consent as part of the agreement. Your voice recording also ends with a consent line spoken in
                your own voice.
              </p>
              <p>
                Giving that consent is your choice. Without it we can&rsquo;t build a persona, so we can&rsquo;t take you on as a client.
              </p>
              <p>
                Two more reasons apply to clients. We need your data to deliver the service you signed up for, and Indonesian tax rules
                require us to keep invoices. You can read more on our <a href="/consent">face and voice page</a>.
              </p>
            </>
          ),
        },
        {
          id: "processors",
          heading: "Who handles it with us",
          body: (
            <>
              <p>We use a few outside services to run produktif.ai. Here is what they do.</p>
              <ul>
                <li>
                  <b>Google Workspace.</b> Applications are stored in a Google Sheet. Client files are kept in a restricted Google shared
                  drive.
                </li>
                <li>
                  <b>Vercel.</b> Hosts this website and runs the application form.
                </li>
                <li>
                  <b>An email delivery provider.</b> Sends your confirmation email and our updates.
                </li>
                <li>
                  <b>A cookieless analytics service.</b> Gives us visit totals. See <a href="#cookies">Cookies and local storage</a> below.
                </li>
                <li>
                  <b>WhatsApp.</b> If you give us your number, we use it to message you. Clients also get video previews and give approvals
                  there.
                </li>
                <li>
                  <b>An e-signature service (clients only).</b> Used to sign the service agreement and consent.
                </li>
                <li>
                  <b>AI providers (clients only).</b> To build your persona and make your videos, your photos, voice recording and scripts
                  are processed by AI providers located outside Indonesia, in the US or the EU. This public page leaves out their names
                  because we keep our production setup private. Your signed consent names each provider and the country it operates in, and
                  you agree to them before we send anything.
                </li>
              </ul>
              <p>We use produktif.ai business accounts with these AI providers and keep each client&rsquo;s files separate.</p>
            </>
          ),
        },
        {
          id: "transfers",
          heading: "Data sent outside Indonesia",
          body: (
            <>
              <p>Some of your data leaves Indonesia.</p>
              <ul>
                <li>
                  <b>Clients:</b> your photos, voice and scripts go to AI providers in the US or the EU. This needs your written consent to
                  that cross-border transfer, which names each provider and its country.
                </li>
                <li>
                  <b>Everyone:</b> the other services listed above may store or process data on servers outside Indonesia.
                </li>
              </ul>
              <p>
                Those countries have their own data protection laws, which differ from Indonesia&rsquo;s. We send each provider only what
                its step needs. When you leave, we delete your files there too (see the next section).
              </p>
            </>
          ),
        },
        {
          id: "retention",
          heading: "How long we keep it",
          body: (
            <>
              <p>
                <b>Waitlist.</b> We keep your application while you&rsquo;re on the waitlist, so we can invite you to a later cohort. When
                we close the waitlist, we delete applications from people who didn&rsquo;t become clients. You can ask us to delete yours
                sooner at any time.
              </p>
              <p>
                <b>Clients.</b> We keep your materials while we make your videos. Within 30 days after you leave, we delete your photos,
                voice recording, persona, scripts, briefs, call recording and our copies of your videos. That includes copies held by our AI
                providers. We confirm in writing once it&rsquo;s done. Your videos are yours, so download them before you go.
              </p>
              <p>
                A few records stay after that: the signed agreement and consent record, the log that your ID check passed, and invoices. We
                keep them only as long as we need them to show we had your consent and to meet Indonesian tax and accounting rules.
              </p>
            </>
          ),
        },
        {
          id: "security",
          heading: "How we protect it",
          body: (
            <>
              <ul>
                <li>
                  Client files live in a restricted Google Workspace shared drive. Signing in needs two-factor authentication, and only the
                  people making your videos have access.
                </li>
                <li>Your ID image is deleted right after the identity match.</li>
                <li>Production machines delete working files after rendering.</li>
                <li>This site and the form use an encrypted connection (HTTPS).</li>
              </ul>
              <p>No system is perfectly safe. If a breach affects your data, we will tell you and report it as Indonesian law requires.</p>
            </>
          ),
        },
        {
          id: "rights",
          heading: "Your rights",
          body: (
            <>
              <p>Under UU PDP you can ask us to:</p>
              <ul>
                <li>show you the data we hold about you and give you a copy</li>
                <li>correct anything that&rsquo;s wrong or out of date</li>
                <li>delete your data</li>
                <li>withdraw your consent</li>
              </ul>
              <p>
                Email <a href="mailto:privacy@produktif.ai">privacy@produktif.ai</a> from the address you used with us. If you write from a
                different address, we may ask you to confirm it&rsquo;s you before we act. We&rsquo;ll reply, and we&rsquo;ll tell you when
                it&rsquo;s done.
              </p>
              <p>
                <b>On the waitlist,</b> withdrawing consent means we stop contacting you and delete your application.
              </p>
              <p>
                <b>As a client,</b> if you withdraw consent for your face and voice, we stop using them and delete your persona. Persona
                videos can&rsquo;t be made without it, so the service ends. Billing then follows your service agreement. Videos you&rsquo;ve
                already posted are on your own accounts, so you decide whether they stay up.
              </p>
              <p>
                If you&rsquo;re unhappy with how we handled a request, you can complain to the Indonesian authority responsible for personal
                data protection.
              </p>
            </>
          ),
        },
        {
          id: "cookies",
          heading: "Cookies and local storage",
          body: (
            <>
              <p>This site has no ad trackers and no tracking cookies.</p>
              <p>
                Our analytics are cookieless. They show us totals, such as how many people visited a page. Nothing in them builds a profile
                of you.
              </p>
              <p>
                The Get started form saves your answers in your own browser (localStorage), so you can pick up where you left off. We clear
                that copy when you answer the last question. If you stop partway, it stays on your device until you come back and finish, or
                until you clear it in your browser settings.
              </p>
              <p>
                If you arrive through a link with campaign tags, your browser keeps those tags in that tab (sessionStorage) until you close
                it. That lets the form record which post sent you.
              </p>
            </>
          ),
        },
        {
          id: "age",
          heading: "Adults only",
          body: (
            <>
              <p>
                produktif.ai is for people aged 18 and over. Please don&rsquo;t apply if you&rsquo;re under 18. Every client passes an ID
                and selfie check that confirms their age. We only build a persona of the creator who signs the agreement, from their own
                face and voice.
              </p>
              <p>If we learn that we&rsquo;ve collected data from someone under 18, we delete it.</p>
            </>
          ),
        },
        {
          id: "changes",
          heading: "Changes to this policy",
          body: (
            <>
              <p>
                When we change this policy, we update the date at the top. If a change affects how we use your face or voice, we ask for
                your consent again before it applies to you. For other important changes, we email waitlist members and clients.
              </p>
            </>
          ),
        },
        {
          id: "contact",
          heading: "Contact",
          body: (
            <>
              <ul>
                <li>
                  Privacy requests: <a href="mailto:privacy@produktif.ai">privacy@produktif.ai</a>
                </li>
                <li>
                  General questions: <a href="mailto:hello@produktif.ai">hello@produktif.ai</a>
                </li>
                <li>
                  Report misuse: <a href="mailto:abuse@produktif.ai">abuse@produktif.ai</a>. Use this if you see a video that misuses
                  someone&rsquo;s face or voice, for example to impersonate them or run a scam. We answer within 2 working days.
                </li>
              </ul>
              <p>produktif.ai, Yogyakarta, Indonesia. Company details will follow once the PT Perorangan is registered.</p>
            </>
          ),
        },
      ]}
    />
  );
}
