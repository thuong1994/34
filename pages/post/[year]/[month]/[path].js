import Head from "next/head";

import { useRouter } from "next/router";
import { parse } from "node-html-parser";

const domain = process.env.DOMAIN || "http://www.dogfull.com/";
const articleSelector = process.env.ARTICLE_SELECTOR || "article.post";

function PostDetail({ data }) {
  const router = useRouter();
  const {
    query: { path, year, month, fbid, fbclid }
  } = router;

  // const [data, setData] = useState(null);
  // const [isLoading, setLoading] = useState(false);

  // useEffect(() => {
  //   setLoading(true);
  //   fetch(`https://dogiloveyou.com/${id}`)
  //     .then(res => res.json())
  //     .then(data => {
  //       setData(data);
  //       setLoading(false);
  //     });
  // }, []);

  if (
    (fbid || fbclid) &&
    path &&
    year &&
    month &&
    typeof window !== "undefined"
  ) {
    window.location.href = `${domain}${year}/${month}/${path}`;
  }

  // console.log("data===", data, router.query);

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
  console.log("context--", context);
  const { path, month, year } = context.params;

  // Fetch data from external API
  const data = await fetch(`${domain}${year}/${month}/${path}`)
    .then(function(response) {
      // When the page is loaded convert it to text
      return response.text();
    })
    .then(async function(html) {
      // Initialize the DOM parser

      // const parser = new DOMParser();

      // // Parse the text
      const doc = parse(html);

      // console.log("xx==", doc.querySelector('meta[property~="og:image"]'));

      // You can now even select part of that html as you would in the regular DOM
      // Example:
      // var docArticle = doc.querySelector('article').innerHTML;

      const xxx = {
        image:
          doc
            .querySelector('meta[property~="og:image"]')
            .getAttribute("content") || "",
        title:
          doc
            .querySelector('meta[property~="og:title"]')
            .getAttribute("content") || "",
        description:
          doc
            .querySelector('meta[property~="og:description"]')
            .getAttribute("content") || "",
        article: doc.querySelector(`${articleSelector}`).innerHTML
        // article: doc
        // .querySelector('article.post').innerHTML
      };

      return JSON.parse(JSON.stringify(xxx));
    })
    .catch(function(err) {
      // console.log("Failed to fetch page: ", err);
      return JSON.parse(JSON.stringify(err));
      // return err;
    });
  // console.log("res===", data);
  // const data = await res.json();

  // Pass data to the page via props
  return { props: { data } };
}

export default PostDetail;
