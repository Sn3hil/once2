import { Hono } from "hono";
import crudRouter from "./crud";
import scenesRouter from "./scenes";
import continueRouter from "./continue";
import forkRouter from "./fork";
import deferredRouter from "./deferred";
import protagonistsRouter from "./protagonists";

const storiesRouter = new Hono();

storiesRouter.route("/", crudRouter);
storiesRouter.route("/", scenesRouter);
storiesRouter.route("/", continueRouter);
storiesRouter.route("/", forkRouter);
storiesRouter.route("/", deferredRouter);
storiesRouter.route("/", protagonistsRouter);

export default storiesRouter;
