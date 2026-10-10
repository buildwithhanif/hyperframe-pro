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
            This is a plain-language draft. An Indonesian lawyer will review it. If you are a client, your signed service agreement governs.
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
              <p>By using this site, you agree to these terms. If you don&rsquo;t agree, please don&rsquo;t use it.</p>
              <ul>
                <li>Use the site for its purpose: learning about the service and applying for it.</li>
                <li>Only submit your own details. Don&rsquo;t apply on behalf of someone else without their permission.</li>
                <li>
                  Don&rsquo;t try to break, overload or scrape the site, its forms or its systems. We limit how often a form can be sent to
                  keep spam out.
                </li>
              </ul>
              <p>
                Numbers on this site about views and followers come from the founder&rsquo;s own accounts. They show what the playbook has
                done for him. They are not a promise about your results. Nobody can guarantee views.
              </p>
              <p>
                The text, design, videos and brand on this site belong to produktif.ai. Please don&rsquo;t copy them or present them as your
                own.
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
                  Slots are limited. We pick clients by fit with the service, and we reply within 2 working days of your application.
                </li>
                <li>If we can&rsquo;t take you yet, we&rsquo;ll keep you posted with a monthly email update.</li>
                <li>
                  You can leave the waitlist at any time. Email{" "}
                  <a href="mailto:privacy@produktif.ai">privacy@produktif.ai</a> and we will remove your details.
                </li>
              </ul>
              <p>
                The onboarding form saves your progress in your own browser until you finish, so you can pick up where you left off.
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
                Our <a href="/privacy">privacy policy</a> explains what we collect when you apply, where it is stored and how to ask for a
                copy or deletion. The site uses no ad trackers or tracking cookies.
              </p>
              <p>
                If you become a client, our <a href="/consent">face and voice page</a> explains how we handle your photos, voice and ID
                check, and how they are deleted when you leave.
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
                The rest of this page summarises the service terms in plain words. Before any work starts, every client signs a service
                agreement. <b>The signed agreement governs.</b> If this summary and your agreement ever differ, your agreement wins.
              </p>
              <p>
                You can only become a client after we have accepted your application, you have paid the deposit and you have signed the
                agreement.
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
                <li>60 short videos a month, about 2 a day, each 30 to 45 seconds long.</li>
                <li>Your own AI persona, made from your recording, with your face and voice.</li>
                <li>Videos in Indonesian, English or a mix. You choose the split each month.</li>
                <li>Vertical files ready to post, with captions on screen and a written caption, hashtags and call to action for each one.</li>
              </ul>
              <p>
                You post the videos yourself. Replying to comments and DMs is not part of the service. There are no tools for you to learn
                and no tool subscriptions to pay for.
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
                <b>Late payments.</b> If a payment is more than 3 days late, we pause production until it arrives.
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
                A refundable deposit of <b>Rp 1,000,000</b> reserves your pilot slot. After you pay it, we make one short test clip of your
                AI persona so you can see it before anything else happens. We aim to start delivery within 7 days of your deposit.
              </p>
              <ul>
                <li>If you approve the test clip, the deposit is credited to your first month.</li>
                <li>If you reject the test clip, we refund the deposit in full.</li>
              </ul>
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
                When you leave, we delete your face, voice and source files everywhere, including at our AI providers, within 30 days. We
                confirm it in writing.
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
                there are no cash refunds. Instead, we make good on anything we miss:
              </p>
              <ul>
                <li>If we miss a video, we catch it up within 7 days.</li>
                <li>
                  If a video is still missing at the end of the month, we credit about <b>Rp 66,700 per video</b> on your next invoice.
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
                  Each week we send that week&rsquo;s scripts in one message. If you don&rsquo;t reply within 24 hours, we go ahead with
                  them.
                </li>
                <li>Videos arrive in weekly batches of 14, a week before they are due to go out.</li>
                <li>You have 48 hours to review each batch. Reply OK, or send notes.</li>
                <li>Text fixes are free, any time. Each video also gets one full redo.</li>
                <li>
                  A video counts toward your 60 once you approve it, or once the 48-hour window passes without notes.
                </li>
              </ul>
              <p>We never post anything for you. Every video goes out only after you have seen it and chosen to post it.</p>
            </>
          ),
        },
        {
          id: "labels",
          heading: "Posting and AI labels",
          body: (
            <>
              <p>
                You approve and post every video, so you are responsible for the claims in the videos you approve. We log sources for every
                script, and a person checks the facts before the video is made. You still have the final say, so watch each one before you
                approve it.
              </p>
              <p>Every video uses an AI persona, so as a client you agree to:</p>
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
              <p>We only make videos with the face and voice of the creator who signed the agreement. That creator must be 18 or older.</p>
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
              <p>
                Misuse means using the service for impersonation, fake endorsements or scams. Here is what happens:
              </p>
              <ul>
                <li>
                  <b>First time:</b> we refuse the request and send you a written warning.
                </li>
                <li>
                  <b>Second time:</b> the agreement ends, we delete your persona and there is no refund.
                </li>
              </ul>
              <p>
                If you see a produktif.ai video being misused, or think someone has used your face or voice without permission, email{" "}
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
                We will only show your videos as public samples if you opt in separately. Saying no doesn&rsquo;t change your service in any
                way.
              </p>
              <p>Our production methods, templates and know-how stay ours.</p>
            </>
          ),
        },
        {
          id: "liability",
          heading: "Liability",
          body: (
            <>
              <p>
                If something goes wrong on our side, our total liability to you is capped at <b>one month&rsquo;s fee</b>.
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
              <p>These terms and every client agreement are governed by the laws of the Republic of Indonesia.</p>
              <p>
                If you have a problem, please write to us first at <a href="mailto:hello@produktif.ai">hello@produktif.ai</a>. Most things
                can be sorted out in a conversation.
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
