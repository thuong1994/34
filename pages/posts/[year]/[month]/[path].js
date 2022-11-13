import Head from "next/head";

import { useRouter } from "next/router";
import { parse } from "node-html-parser";

const domain = process.env.NEXT_PUBLIC_DOMAIN_URL;

function PostDetail({ data }) {
  const router = useRouter();
  const {
    query: { path, year, month },
  } = router;

  const isRedirect =
    typeof window !== "undefined" &&
    (window.location.search ||
      (typeof document !== "undefined" &&
        document.referrer.indexOf("facebook.com") !== -1)) &&
    path &&
    year &&
    month
      ? true
      : false;

  if (isRedirect) {
    window.location.href = `${domain}${year}/${month}/${path}`;
  }

  return (
    <div>
      <Head>
        {data.title && <title>{data.title}</title>}
        {data.title && <meta name="og:title" content={data.title} />}
        {data.image && <meta name="og:image" content={data.image} />}
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-tight md:leading-none mb-12 text-center md:text-left">
          {data.title}
        </h1>
        <p>You are being redirected to the post, please wait 1-2 seconds...</p>
      </main>
    </div>
  );
}

// This gets called on every request
export async function getServerSideProps(context) {
  const { path, month, year } = context.params;

  if ((context?.req?.headers?.referer || "").indexOf("facebook.com") !== -1) {
    context.res.setHeader("location", `${domain}${slug}`);
    context.res.statusCode = 301;
    context.res.end();
    return { props: { data: {} } };
  }

  // Fetch data from external API
  const data = await fetch(`${domain}${year}/${month}/${path}`)
    .then(function (response) {
      // When the page is loaded convert it to text
      return response.text();
    })
    .then(async function (html) {
      // Initialize the DOM parser

      // // Parse the text
      const doc = parse(html);

      const articleData = {
        image:
          doc
            .querySelector('meta[property~="og:image"]')
            .getAttribute("content") || "",
        title:
          doc
            .querySelector('meta[property~="og:title"]')
            .getAttribute("content") || "",
      };

      return JSON.parse(JSON.stringify(articleData));
    })
    .catch(function (err) {
      return JSON.parse(JSON.stringify(err));
    });

  // Pass data to the page via props
  return { props: { data } };
}

export default PostDetail;
