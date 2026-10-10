import type { Metadata } from "next";
import LegalPage from "@/components/site/LegalPage";
import "../tokens.css";
import "../legal.css";

export const metadata: Metadata = {
  title: "Face and voice | produktif.ai",
  description: "What we collect to build your AI persona, and how you stay in control of your face and voice.",
  alternates: { canonical: "/consent" },
};

export default function ConsentPage() {
  return (
    <LegalPage
      title="How we use your face and voice"
      updated="11 October 2026"
      intro={
        <>
          <p>Your face and voice are personal. This page explains in plain words what happens to them when you work with us.</p>
          <p>This is a plain-language draft that an Indonesian lawyer will review. If you are a client, your signed agreement governs.</p>
        </>
      }
      sections={[
        {
          id: "short",
          heading: "The short version",
          body: (
            <>
              <ul>
                <li>We use your face and voice only to make your own videos.</li>
                <li>You review every video and post it yourself.</li>
                <li>You turn on an AI label for every video you post.</li>
                <li>You can withdraw consent at any time. We then stop, delete your files within 30 days and confirm it in writing.</li>
                <li>You own your videos and your likeness.</li>
              </ul>
            </>
          ),
        },
        {
          id: "ask",
          heading: "What we ask for, and when",
          body: (
            <>
              <p>
                The waitlist and apply form never ask for photos, voice or ID. They ask for your contact details and some questions about
                you and your content. Our <a href="/privacy">privacy policy</a> covers that part.
              </p>
              <p>We ask for the items below only after you pay the deposit and sign the service agreement.</p>
              <table>
                <tbody>
                  <tr>
                    <th scope="row">3 photos of your face</th>
                    <td>One from the front and two from different angles. They become your persona&rsquo;s face.</td>
                  </tr>
                  <tr>
                    <th scope="row">A 2-minute voice recording</th>
                    <td>
                      You read a short script we send you. It ends with a consent line spoken in your own voice. The recording becomes your
                      persona&rsquo;s voice.
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">ID and a live selfie</th>
                    <td>Your KTP, or your passport if you live outside Indonesia. Both are checked once, for identity and age only.</td>
                  </tr>
                  <tr>
                    <th scope="row">Your brief and onboarding call</th>
                    <td>
                      Your answers to our brief and a recording of the onboarding call. They help us write scripts that sound like you and
                      fit your niche.
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Scripts and videos</th>
                    <td>The scripts we write for you and the videos we make from them.</td>
                  </tr>
                </tbody>
              </table>
              <p>There is no filming session.</p>
            </>
          ),
        },
        {
          id: "make",
          heading: "What we make with it",
          body: (
            <>
              <p>
                From your photos and recording, we build one AI persona. It is a digital likeness, made from your recording, that speaks the
                scripts we write for you. It is used for your videos and nobody else&rsquo;s.
              </p>
              <p>
                After your deposit, we make one test clip first. If it doesn&rsquo;t feel like you, you can reject it. We then refund your
                Rp 1,000,000 deposit and delete your files.
              </p>
              <p>
                Once you approve the test clip, your persona opens and closes each video. The middle of each video is motion graphics and
                screen demos made in-house. Each week we send you the scripts before we make the videos. You can change or cut any of them.
                No reply within 24 hours means we go ahead.
              </p>
              <p>Your persona only tells personal stories you gave us yourself at onboarding. We never invent experiences for you.</p>
            </>
          ),
        },
        {
          id: "consent",
          heading: "How you give consent",
          body: (
            <>
              <p>You give consent in two ways.</p>
              <ul>
                <li>
                  <b>In writing.</b> You e-sign the service agreement and a consent form. The form explains what we collect and why. It also
                  names every company that processes your photos and recording.
                </li>
                <li>
                  <b>Out loud.</b> Your voice recording ends with a consent line, spoken by you. It shows that the voice is yours and that
                  you agreed.
                </li>
              </ul>
              <p>
                Building a persona needs specialized AI providers. The ones we use are located outside Indonesia, in the United States or
                the European Union. Your consent form names each provider and its country, and asks you to agree to your data being sent
                there. You see that list before you sign anything, and we send nothing until you agree.
              </p>
              <p>
                Those countries have their own data protection laws, which differ from Indonesia&rsquo;s. Other services we use, such as
                Google Workspace, may also store data on servers outside Indonesia.
              </p>
              <p>
                This public page leaves out the providers&rsquo; names because we keep our production setup private. If you say no to the
                transfer, we can&rsquo;t build your persona.
              </p>
            </>
          ),
        },
        {
          id: "identity",
          heading: "The identity and age check",
          body: (
            <>
              <p>We only build a persona from the face and voice of the person who signs the agreement. That person must be 18 or older.</p>
              <p>
                To check this, you show your KTP or passport and take a live selfie. We match the two. Right after the match, we delete the
                ID image. From the check itself, we keep only a record that it passed. The selfie is used for this match and nothing else.
              </p>
              <p>
                This check makes it much harder for anyone to build a persona of someone else. That protects you, and anyone whose face
                could be misused.
              </p>
            </>
          ),
        },
        {
          id: "who",
          heading: "Who handles your files",
          body: (
            <>
              <ul>
                <li>
                  <b>Our team.</b> Only the people producing your videos can open your files. During the first pilot, that is the founder.
                  If this changes, we will update this page.
                </li>
                <li>
                  <b>AI providers.</b> They process your photos and voice to build your persona. Your scripts go to them too, so the persona
                  can speak them. We use produktif.ai business accounts with them and keep each client&rsquo;s material separate.
                </li>
                <li>
                  <b>Google Workspace.</b> Stores your files.
                </li>
                <li>
                  <b>WhatsApp and email.</b> We send scripts and video previews on WhatsApp. Our emails go out through an email delivery
                  provider.
                </li>
                <li>
                  <b>An e-signature service.</b> Used to sign the agreement and consent form.
                </li>
              </ul>
              <p>
                We never sell or rent your face, voice or any other data. We share it only with the people and services on this page, or
                when the law requires it.
              </p>
            </>
          ),
        },
        {
          id: "where",
          heading: "Where it lives and for how long",
          body: (
            <>
              <p>
                Your files live in a restricted Google Workspace shared drive. Signing in needs two-step verification (2FA). The computers
                that render your videos delete their working files after each render.
              </p>
              <p>&ldquo;Leaving&rdquo; below means your agreement ends for any reason, including a rejected test clip.</p>
              <table>
                <tbody>
                  <tr>
                    <th scope="row">Photos, voice, persona</th>
                    <td>Kept while you are a client. Deleted within 30 days after you leave.</td>
                  </tr>
                  <tr>
                    <th scope="row">Brief, call recording, scripts</th>
                    <td>Same as above.</td>
                  </tr>
                  <tr>
                    <th scope="row">ID image</th>
                    <td>Deleted right after the identity match. We keep only a record that the check passed.</td>
                  </tr>
                  <tr>
                    <th scope="row">Selfie</th>
                    <td>Used only for the identity match. Deleted along with your photos.</td>
                  </tr>
                  <tr>
                    <th scope="row">Videos</th>
                    <td>Yours to keep, so download them before you go. Our copies follow the same 30-day deletion.</td>
                  </tr>
                  <tr>
                    <th scope="row">Signed agreement, consent record, ID check log, invoices</th>
                    <td>
                      Kept after you leave, only as long as we need them to show we had your consent and to meet Indonesian tax and
                      accounting rules.
                    </td>
                  </tr>
                </tbody>
              </table>
              <p>Deletion includes the copies held by our AI providers. Once it is done, we confirm it to you in writing.</p>
              <p>No system is perfectly safe. If a breach affects your data, we will tell you and report it as Indonesian law requires.</p>
            </>
          ),
        },
        {
          id: "never",
          heading: "What we will never do",
          body: (
            <>
              <ul>
                <li>Use your face or voice for anything beyond your videos. That rules out other clients and our own ads.</li>
                <li>Build a persona of anyone other than the person who signs, or of anyone under 18.</li>
                <li>Post on your accounts.</li>
                <li>Show your videos as samples on our site or socials unless you opt in separately. Saying no is fine.</li>
                <li>
                  Make videos about politics, SARA (ethnic, religious or racial division), gambling or pinjol (online loans). Get-rich
                  claims and personal medical, legal or investment advice are off-limits too.
                </li>
                <li>Keep your persona or the material behind it once the 30 days after you leave are up.</li>
              </ul>
            </>
          ),
        },
        {
          id: "controls",
          heading: "Your controls",
          body: (
            <>
              <ul>
                <li>
                  <b>Approve every video.</b> We send finished videos in weekly batches of 14. You have 48 hours to review each batch. Each
                  video gets one full redo, and text fixes are free. If the 48 hours pass without a reply, the batch counts as delivered.
                  Nothing goes online unless you post it.
                </li>
                <li>
                  <b>Withdraw consent.</b> Email <a href="mailto:privacy@produktif.ai">privacy@produktif.ai</a>. We stop making videos with
                  your persona, delete your files within 30 days and confirm it in writing.
                </li>
                <li>
                  <b>Ask about your data.</b> At the same address, you can ask for a copy of what we hold, or ask us to correct or delete
                  it.
                </li>
              </ul>
              <p>
                We can&rsquo;t make your videos without your persona, so withdrawing consent also ends the service. Payments already made
                follow the rules in your service agreement. Videos you already have stay yours.
              </p>
            </>
          ),
        },
        {
          id: "labels",
          heading: "AI labels",
          body: (
            <>
              <p>
                Your persona is AI, and your viewers should know that. When you post a video, you switch on the platform&rsquo;s own AI
                label. You also keep a line in your bio saying your videos use an AI persona.
              </p>
              <p>Both are part of the client agreement. We think being upfront about AI helps your audience trust you.</p>
            </>
          ),
        },
        {
          id: "own",
          heading: "Who owns what",
          body: (
            <>
              <p>
                You own your videos and your likeness. We get a license to use them for one purpose: producing your videos for you. The
                license ends when you leave.
              </p>
              <p>
                You approve and post every video, so you are responsible for the claims in videos you approve. To help with that, we log
                sources for each script and a person checks it before we make the video.
              </p>
            </>
          ),
        },
        {
          id: "misuse",
          heading: "Reporting misuse",
          body: (
            <>
              <p>
                If you see a video that uses your face or voice without your agreement, please tell us. Please also report a persona used
                for impersonation, fake endorsements or scams.
              </p>
              <p>
                Email <a href="mailto:abuse@produktif.ai">abuse@produktif.ai</a> with the link and a short note about what is wrong. We
                answer within 2 working days.
              </p>
              <p>If one of our clients breaks these rules:</p>
              <ul>
                <li>First breach: we refuse the video and send a written warning.</li>
                <li>Second breach: the agreement ends, we delete the persona and there is no refund.</li>
              </ul>
              <p>We also turn away clients in gambling, trading or shady finance, and MLM or get-rich-quick schemes.</p>
            </>
          ),
        },
        {
          id: "law",
          heading: "Your rights under Indonesian law",
          body: (
            <>
              <p>
                Indonesia&rsquo;s Personal Data Protection Law (UU PDP, Law 27 of 2022) treats biometric data as specific personal data, and
                using it needs your explicit consent. We treat your photos and recording that way. That is why we ask for consent in writing
                and out loud.
              </p>
              <p>
                You can ask to see your data, correct it, delete it or withdraw your consent. Email{" "}
                <a href="mailto:privacy@produktif.ai">privacy@produktif.ai</a> and tell us what you need.
              </p>
            </>
          ),
        },
        {
          id: "contact",
          heading: "Who we are and how to reach us",
          body: (
            <>
              <table>
                <tbody>
                  <tr>
                    <th scope="row">Operator</th>
                    <td>produktif.ai, run by its founder, Hanif Produktif, in Yogyakarta, Indonesia</td>
                  </tr>
                  <tr>
                    <th scope="row">Legal entity</th>
                    <td>A PT Perorangan is being set up. We will add its details here once it is registered.</td>
                  </tr>
                  <tr>
                    <th scope="row">Questions</th>
                    <td>
                      <a href="mailto:hello@produktif.ai">hello@produktif.ai</a>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Privacy requests</th>
                    <td>
                      <a href="mailto:privacy@produktif.ai">privacy@produktif.ai</a>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Misuse reports</th>
                    <td>
                      <a href="mailto:abuse@produktif.ai">abuse@produktif.ai</a>, answered within 2 working days
                    </td>
                  </tr>
                </tbody>
              </table>
              <p>
                See also our <a href="/privacy">privacy policy</a> and <a href="/terms">terms</a>.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
