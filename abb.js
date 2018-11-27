var airbnb_air = require('airapi');

const MonkeyLearn = require('monkeylearn')

const ml = new MonkeyLearn('')
const ml2 = new MonkeyLearn('')
let model_id = ''
let kw_model_id = ''

function get_kws(extractions){
  return extractions.map(function(extraction) {return {'keyword': extraction.parsed_value,
    'relevance': extraction.relevance}})
}

 function get_sentiments(reviews) {
  ml2.classifiers.classify(model_id, reviews)
  .then(res => {
      const text_sentiment = {}
      const sentiment_kw = {
        'Positive': {
            'count': 0,
            'keywords' : {}
          },
        'Negative': {
            'count': 0,
            'keywords' : {}
          },
        'Neutral':  {
            'count': 0,
            'keywords' : {}
          }
        }
      const text_kw = {}
      res.body.map(element => text_sentiment[element.text] = element.classifications[0].tag_name)

      ml.extractors.extract(kw_model_id, reviews).then(res => {
        res.body.map(element => text_kw[element.text] = get_kws(element.extractions))

      reviews.map(function(element) {
        const sentiment = text_sentiment[element]
        const kws = text_kw[element]
        const existing_kw_sent = sentiment_kw[sentiment]
        existing_kw_sent.count += 1
        kws.map(function(kw) {
          if (kw.keyword in existing_kw_sent.keywords) {
            existing_kw_sent.keywords[kw.keyword].count += 1
            existing_kw_sent.keywords[kw.keyword].relevance += kw.relevance
          } else {
            existing_kw_sent.keywords[kw.keyword] = { count: 1, relevance: kw.relevance }
          }
        }
      )}
    )
      return sentiment_kw
      }
      ).catch(err => console.log(err))
    })
  .catch(err => console.log(err))
}

 function get_reviews() {
  const host_id = 19303406
reviews_promises = [...Array(17)].map((_,i) =>
    airbnb_air.getReviews(host_id, {
      page: i,
      role: 'host'
    }));

  return Promise.all(reviews_promises).then(
    function(review_lists) {
      all_reviews = [].concat.apply([], review_lists);
      return all_reviews
    }
  )
  }

async function do_all() {
   const all_reviews = await get_reviews()
   const all_sentiments = await get_sentiments(all_reviews)
   console.log(all_sentiments)
 }

do_all()
