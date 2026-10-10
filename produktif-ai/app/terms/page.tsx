import type { Metadata } from "next";
import LegalPage from "@/components/site/LegalPage";
import "../tokens.css";
import "../legal.css";

export const metadata: Metadata = {
  title: "Terms · produktif.ai",
  description:
    "The rules for using produktif.ai and joining the waitlist, plus a plain summary of the service terms for clients: price, billing, cancelling, refunds, approvals, AI labels and content rules.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage
      kicker="Terms"
      title="Terms of use and service"
      updated="11 October 2026"
      intro={
        <>
          <p>
            This page has two parts. Part one covers using this website and joining the waitlist. Part two is a short summary of how the
            service works once you become a client.
          </p>
          <p>
            This is a plain-language draft. An Indonesian lawyer will review it. For clients, the signed service agreement governs.
          </p>
        </>
      }
      sections={[
        {
          id: "who",
          heading: "Who runs produktif.ai",
          body: (
            <>
              <p>
                produktif.ai is a done-for-you AI video service based in Yogyakarta, Indonesia. It is run by its founder, Hanif Produktif.
              </p>
              <p>
                We are setting up a PT Perorangan to operate the service. Once it is registered, we will add the company&rsquo;s name,
                address and registration details here.
              </p>
              <p>
                In these terms, &ldquo;we&rdquo; and &ldquo;us&rdquo; mean produktif.ai. &ldquo;You&rdquo; means the person using the site
                or, in part two, the client.
              </p>
            </>
          ),
        },
        {
          id: "site",
          heading: "Using this website",
          body: (
            <>
              <p>By using this site, you agree to these terms. Please don&rsquo;t use it if you disagree with them.</p>
              <ul>
                <li>Use the site for its purpose: learning about the service and applying for it.</li>
                <li>Only submit your own details. Don&rsquo;t apply on behalf of someone else without their permission.</li>
                <li>Don&rsquo;t attack or scrape the site or its forms. We limit how often a form can be sent to keep spam out.</li>
              </ul>
              <p>
                View and follower numbers on this site come from the founder&rsquo;s own accounts. They are his results. Yours may be
                higher or lower, and nobody can guarantee views.
              </p>
              <p>
                The text, design, videos and brand on this site are ours or used with permission. Please don&rsquo;t copy them or pass
                them off as your own.
              </p>
            </>
          ),
        },
        {
          id: "waitlist",
          heading: "Joining the waitlist",
          body: (
            <>
              <p>
                Joining the waitlist is free. It doesn&rsquo;t commit you to buy anything, and it doesn&rsquo;t commit us to take you on.
              </p>
              <ul>
                <li>
                  When you apply, we ask for your name, email, an optional WhatsApp number and a short creator profile. Please give accurate
                  answers so we can judge fit fairly.
                </li>
                <li>Clients must be 18 or older. Please apply only if you are.</li>
                <li>
                  Slots are limited, and we pick clients by fit with the service. We reply within 2 working days of your application.
                </li>
                <li>
                  While you wait for a slot, we send a short monthly email update. Reply to any of them to stop them.
                </li>
                <li>
                  You can leave the waitlist at any time. Email{" "}
                  <a href="mailto:privacy@produktif.ai">privacy@produktif.ai</a> and we will remove your details.
                </li>
              </ul>
              <p>
                The onboarding form saves your progress in your own browser until you finish. That lets you pick up where you left off.
                Clearing your browser data removes it.
              </p>
            </>
          ),
        },
        {
          id: "data",
          heading: "Your data",
          body: (
            <>
              <p>
                Our <a href="/privacy">privacy policy</a> explains what we collect when you apply and how to ask for a copy or deletion.
                The site has no ad trackers or tracking cookies.
              </p>
              <p>
                Clients share more: photos, a voice recording and an ID check. Our <a href="/consent">face and voice page</a> covers how
                we handle them. Part two below has the short version.
              </p>
            </>
          ),
        },
        {
          id: "client-terms",
          heading: "For clients: how this summary works",
          body: (
            <>
              <p>
                The rest of this page summarises the service terms in plain words. Every client signs a service agreement before any work
                starts. <b>The signed agreement governs.</b> Where this summary and your agreement differ, your agreement wins.
              </p>
              <p>
                You become a client once you sign the agreement and pay the deposit. We only ask for either after we accept your
                application.
              </p>
            </>
          ),
        },
        {
          id: "service",
          heading: "What you get",
          body: (
            <>
              <ul>
                <li>60 short videos a month, about 2 a day, 30 to 45 seconds long.</li>
                <li>
                  Your own AI persona, made from your recording, with your face and voice. It opens and closes your videos. The middle is
                  motion graphics and screen demos made in-house.
                </li>
                <li>Videos in Indonesian, English or a mix. You pick the split month by month.</li>
                <li>Vertical files ready to post, with captions on screen and a written caption, hashtags and call to action per video.</li>
              </ul>
              <p>
                You post the videos yourself. Replying to comments and DMs is not part of the service. There are no tools for you to learn
                and no tool subscriptions to pay for.
              </p>
            </>
          ),
        },
        {
          id: "face-voice",
          heading: "Your face, voice and ID",
          body: (
            <>
              <p>
                Indonesia&rsquo;s Personal Data Protection Law (UU PDP, Law 27 of 2022) treats biometric data, such as your face and
                voice, as specific personal data. Using it needs your explicit consent. You give it twice: by e-signing a consent form,
                and by saying a consent line at the end of your voice recording.
              </p>
              <p>
                The AI providers that build and run your persona are located outside Indonesia, in the United States or the European
                Union. Your consent form names each provider and its country, and asks you to agree to your data being sent there. You
                see that list before you sign.
              </p>
              <p>
                To confirm you are the person in the videos and that you are 18 or older, we match your KTP or passport to a live selfie.
                We delete the ID image right after the match and keep only a record that the check passed.
              </p>
              <p>
                You can ask to see, correct or delete your data, or withdraw your consent, at{" "}
                <a href="mailto:privacy@produktif.ai">privacy@produktif.ai</a>. We can&rsquo;t make your videos without your face and
                voice, so withdrawing consent also ends the service. Payments already made follow your service agreement.
              </p>
            </>
          ),
        },
        {
          id: "price",
          heading: "Price and billing",
          body: (
            <>
              <table>
                <tbody>
                  <tr>
                    <th scope="row">Founding price</th>
                    <td>Rp 4,000,000 per month for 60 videos</td>
                  </tr>
                  <tr>
                    <th scope="row">Setup fee</th>
                    <td>None</td>
                  </tr>
                  <tr>
                    <th scope="row">Commitment</th>
                    <td>Month to month</td>
                  </tr>
                  <tr>
                    <th scope="row">Billing</th>
                    <td>Monthly in advance, by invoice and bank transfer</td>
                  </tr>
                  <tr>
                    <th scope="row">First billing month</th>
                    <td>Starts when you approve your AI persona</td>
                  </tr>
                  <tr>
                    <th scope="row">Price changes</th>
                    <td>Announced at least 30 days ahead</td>
                  </tr>
                </tbody>
              </table>
              <p>
                Prices are in Indonesian rupiah. The founding price is for our first cohort of clients. Later cohorts may pay more.
              </p>
              <p>
                <b>Late payments.</b> A payment more than 3 days late pauses production until it arrives.
              </p>
            </>
          ),
        },
        {
          id: "deposit",
          heading: "The deposit",
          body: (
            <>
              <p>
                A refundable deposit of <b>Rp 1,000,000</b> reserves your pilot slot. After the deposit, you sign the agreement and send
                your photos and voice recording. We then make one short test clip of your AI persona for you to judge.
              </p>
              <ul>
                <li>Approve the test clip, and the deposit is credited to your first month.</li>
                <li>Reject it, and we refund the deposit in full and delete your files.</li>
              </ul>
              <p>
                We aim to start delivery within 7 days of your deposit. That timing depends on your photos and recording reaching us
                quickly.
              </p>
            </>
          ),
        },
        {
          id: "cancel",
          heading: "Cancelling and pausing",
          body: (
            <>
              <p>
                You can cancel any month. Tell us in writing at least <b>7 days before your next billing date</b>, and you won&rsquo;t be
                billed again. The month you have already paid for is delivered in full.
              </p>
              <p>You can pause once a year, for up to one month.</p>
              <p>
                When you leave, we delete your face, voice and source files everywhere within 30 days, including at our AI providers. We
                confirm it in writing. A few records stay after that: the signed agreement and consent record, the log that your ID check
                passed, and invoices. We keep them only to show we had your consent and to meet Indonesian tax and accounting rules.
              </p>
            </>
          ),
        },
        {
          id: "refunds",
          heading: "Refunds and make-goods",
          body: (
            <>
              <p>
                Our commitment is 60 finished videos a month. We can&rsquo;t promise views, and nobody honestly can. Once delivery starts,
                there are no cash refunds. When we fall short on videos, this is how we make it good:
              </p>
              <ul>
                <li>A missed video is caught up within 7 days.</li>
                <li>
                  A video still missing at the end of the month is credited on your next invoice at one sixtieth of your monthly fee.
                  At the founding price that is about <b>Rp 66,700 per video</b>.
                </li>
              </ul>
            </>
          ),
        },
        {
          id: "approvals",
          heading: "Reviews, approvals and redos",
          body: (
            <>
              <ul>
                <li>
                  Scripts come once a week, in one message. No reply within 24 hours means we go ahead with them.
                </li>
                <li>Videos arrive in weekly batches of 14, a week before they are due to go out.</li>
                <li>You have 48 hours to review each batch. Reply OK, or send notes.</li>
                <li>Text fixes are free, any time. You also get one full redo per video.</li>
                <li>
                  A video counts toward your 60 once you approve it, or once the 48-hour window passes without notes.
                </li>
              </ul>
              <p>We never post anything for you. You decide what goes out and when.</p>
            </>
          ),
        },
        {
          id: "labels",
          heading: "Posting and AI labels",
          body: (
            <>
              <p>
                You approve and post the videos, so the claims in videos you approve are your responsibility. To help, we log the sources
                behind every script, and a person checks the facts before production. Please still watch them before you approve.
              </p>
              <p>Because the videos use an AI persona, you agree to:</p>
              <ul>
                <li>switch on the platform&rsquo;s AI label every time you post one of our videos;</li>
                <li>keep a line in your bio saying your videos use an AI persona.</li>
              </ul>
            </>
          ),
        },
        {
          id: "content",
          heading: "Content rules",
          body: (
            <>
              <p>
                We only make videos with the face and voice of the creator who signed the agreement, and that creator must be 18 or older.
              </p>
              <p>We don&rsquo;t make videos about:</p>
              <ul>
                <li>politics or SARA (ethnicity, religion, race and inter-group issues);</li>
                <li>gambling or pinjol (online lending apps);</li>
                <li>get-rich claims;</li>
                <li>personal medical, legal or investment advice.</li>
              </ul>
              <p>
                We don&rsquo;t take on clients in gambling, trading or shady finance, MLM or get-rich-quick schemes. Personal stories in your
                videos come only from real stories you gave us during onboarding.
              </p>
            </>
          ),
        },
        {
          id: "misuse",
          heading: "Misuse",
          body: (
            <>
              <p>Misuse means using the service for impersonation, fake endorsements or scams. Here is what happens:</p>
              <ul>
                <li>
                  <b>First time:</b> we refuse the request and send you a written warning.
                </li>
                <li>
                  <b>Second time:</b> the agreement ends and we delete your persona. There is no refund.
                </li>
              </ul>
              <p>
                Seen a produktif.ai video being misused, or think someone used your face or voice without permission? Email{" "}
                <a href="mailto:abuse@produktif.ai">abuse@produktif.ai</a>. We answer within 2 working days.
              </p>
            </>
          ),
        },
        {
          id: "ownership",
          heading: "Who owns what",
          body: (
            <>
              <p>
                <b>You own your videos and your likeness.</b> We get a licence to use your face, voice and materials only to make your
                videos for you, and only while you are a client.
              </p>
              <p>
                Public samples of your videos need your separate opt-in. Saying no doesn&rsquo;t change your service at all.
              </p>
              <p>Our production methods and templates stay ours.</p>
            </>
          ),
        },
        {
          id: "liability",
          heading: "Liability",
          body: (
            <>
              <p>
                For anything that goes wrong on our side, our total liability to you is capped at <b>one month&rsquo;s fee</b>.
              </p>
              <p>
                We don&rsquo;t control social platforms. We aren&rsquo;t responsible for their algorithms, reach, policy changes or decisions
                about your account.
              </p>
              <p>Nothing in these terms takes away rights you have under Indonesian law that cannot be limited by contract.</p>
            </>
          ),
        },
        {
          id: "changes",
          heading: "Changes to these terms",
          body: (
            <>
              <p>
                We may update this page as the service grows and after legal review. When we do, we change the date at the top. Price
                changes for clients are announced at least 30 days ahead. Any other change to a client&rsquo;s service follows the process in
                their signed agreement.
              </p>
            </>
          ),
        },
        {
          id: "law",
          heading: "Governing law",
          body: (
            <>
              <p>These terms and all client agreements are governed by the laws of the Republic of Indonesia.</p>
              <p>
                Got a problem? Please write to us first at <a href="mailto:hello@produktif.ai">hello@produktif.ai</a>. Most things can be
                sorted out in a conversation.
              </p>
            </>
          ),
        },
        {
          id: "contact",
          heading: "Contact",
          body: (
            <>
              <table>
                <tbody>
                  <tr>
                    <th scope="row">General questions</th>
                    <td>
                      <a href="mailto:hello@produktif.ai">hello@produktif.ai</a>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Privacy and data requests</th>
                    <td>
                      <a href="mailto:privacy@produktif.ai">privacy@produktif.ai</a>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Misuse reports</th>
                    <td>
                      <a href="mailto:abuse@produktif.ai">abuse@produktif.ai</a> (answered within 2 working days)
                    </td>
                  </tr>
                </tbody>
              </table>
            </>
          ),
        },
      ]}
    />
  );
}
