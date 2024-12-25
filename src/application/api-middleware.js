import {
  ADD_COMMENT_ACTION,
  DELETE_TALK_ACTION,
  START_ACTION,
  SUBMIT_TALK_ACTION,
} from '../domain/action-types.js';
import * as actions from '../domain/actions.js';
import { Api, TalksUpdatedEvent } from '../infrastructure/api.js';
import {
  AddCommentCommand,
  DeleteTalkCommand,
  SubmitTalkCommand,
} from '../../shared/messages.js';
import { Comment } from '../../shared/talks.js';

export function createApiMiddleware(api = Api.create()) {
  return ({ getState, dispatch }) => {
    return (next) => (action) => {
      switch (action.type) {
        case START_ACTION: {
          api.addEventListener(
            TalksUpdatedEvent.TYPE,
            (/** @type {TalksUpdatedEvent} */ event) =>
              dispatch(actions.talksUpdated(event.talks)),
          );
          api.connect();
          break;
        }
        case SUBMIT_TALK_ACTION: {
          const presenter = getState().user;
          const { title, summary } = action.payload;
          const command = SubmitTalkCommand.create({
            title,
            presenter,
            summary,
          });
          api.submitTalk(command);
          break;
        }
        case ADD_COMMENT_ACTION: {
          const author = getState().user;
          const { title, message } = action.payload;
          const command = AddCommentCommand.create({
            title,
            comment: Comment.create({ author, message }),
          });
          api.addComment(command);
          break;
        }
        case DELETE_TALK_ACTION: {
          const { title } = action.payload;
          const command = DeleteTalkCommand.create({ title });
          api.deleteTalk(command);
          break;
        }
      }
      return next(action);
    };
  };
}
