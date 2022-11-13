import Head from "next/head";

import { useRouter } from "next/router";
import { parse } from "node-html-parser";

const domain = process.env.NEXT_PUBLIC_DOMAIN;
const articleSelector = process.env.NEXT_PUBLIC_ARTICLE_SELECTOR;

function PostDetail({ data }) {
  const router = useRouter();
  const {
    query: { year }
  } = router;

  if (typeof window !== "undefined" && window.location.search && year) {
    window.location.href = `${domain}${year}`;
  }

  if (typeof window !== "undefined" && window.location.search) {
    return null;
  }

  return (
    <div>
      <Head>
        {data.title && <title>{data.title}</title>}
        {data.title && <meta name="og:title" content={data.title} />}
        {data.description && (
          <>
            <meta name="og:description" content={data.description} />
            <meta name="description" content={data.description} />
          </>
        )}
        {data.image && <meta name="og:image" content={data.image} />}
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        {data.article && (
          <div
            dangerouslySetInnerHTML={{
              __html: `${data.article
                .replace(/<style.*?<\/style>/g, "")
                .replace(/<script.*?<\/script>/g, "")}`
            }}
          />
        )}
      </main>
    </div>
  );
}

// This gets called on every request
export async function getServerSideProps(context) {
  const { year } = context.params;
  const { fbid, fbclid } = context.query;

  if (fbid || fbclid) {
    context.res.setHeader("location", `${domain}${year}`);
    context.res.statusCode = 301;
    context.res.end();
    return { props: { data: {} } };
  }

  // Fetch data from external API
  const data = await fetch(`${domain}${year}`)
    .then(function(response) {
      // When the page is loaded convert it to text
      return response.text();
    })
    .then(async function(html) {
      // Parse the text
      const doc = parse(html);

      const articleData = {
        image:
          doc
            .querySelector('meta[property~="og:image"]')
            ?.getAttribute("content") || "",
        title:
          doc
            .querySelector('meta[property~="og:title"]')
            ?.getAttribute("content") || "",
        description:
          doc
            .querySelector('meta[property~="og:description"]')
            ?.getAttribute("content") || "",
        article: doc.querySelector(`${articleSelector}`)?.innerHTML || ""
      };

      return JSON.parse(JSON.stringify(articleData));
    })
    .catch(function(err) {
      return JSON.parse(JSON.stringify(err));
    });

  // Pass data to the page via props
  return { props: { data } };
}

export default PostDetail;
