import Koa from 'koa';
import cors from 'kcors';
import parser from 'koa-bodyparser';
import logger from 'koa-logger';
import Router from 'koa-router';
import Joi from 'joi';

import Mongo from './mongo';

const app = new Koa();
const router = new Router();
Mongo(app);

const check = (query, checker) => !Joi.validate(query, checker).error;

const vote = Joi.object().keys({
  user: Joi.string().required(),
});

const comment = Joi.object().keys({
  comment: Joi.string().required(),
  user: Joi.string().required(),
});

router
  .get('/votes/:id', async (ctx) => {
    ctx.body = await ctx.app.votes.find({ postID: ctx.params.id }).count();
  })
  .get('/comments/:id', async (ctx) => {
    ctx.body = await ctx.app.comments.find({ postID: ctx.params.id }).toArray();
  })
  .post('/votes/:id', async (ctx) => {
    const { body } = ctx.request;
    const valid =
      check(body, vote) &&
      !(await ctx.app.votes.findOne({
        user: body.user,
        postID: ctx.params.id,
      }));

    if (valid) {
      await ctx.app.votes.insertOne({
        user: body.user,
        postID: ctx.params.id,
      });
      ctx.status = 201;
      ctx.body = await ctx.app.votes.find({ postID: ctx.params.id }).count();
    } else {
      ctx.status = 400;
    }
  })
  .post('/comments/:id', async (ctx) => {
    const { body } = ctx.request;
    const valid = check(body, comment);
    if (valid) {
      await ctx.app.comments.insertOne({
        user: body.user,
        comment: body.comment,
        postID: ctx.params.id,
      });
      ctx.status = 201;
      ctx.body = await ctx.app.comments.find({ postID: ctx.params.id }).toArray();
    } else {
      ctx.status = 400;
    }
  });

app.use(cors());
app.use(parser());
app.use(logger());

app.use(router.routes(), router.allowedMethods());

app.listen(3010);
console.log('Application running on port 3010');
