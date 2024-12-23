import { Repository } from '../infrastructure/repository.js';
import { CHANGE_USER_ACTION, START_ACTION } from '../domain/action-types.js';
import * as actions from '../domain/actions.js';
import { User } from '../domain/users.js';

export function createRepositoryMiddleware(repository = Repository.create()) {
  return ({ dispatch }) => {
    return (next) => (action) => {
      switch (action.type) {
        case START_ACTION:
          repository
            .load()
            .then((user) =>
              dispatch(actions.userChanged(user?.username ?? 'Anon')),
            );
          break;
        case CHANGE_USER_ACTION:
          repository
            .store(User.create({ username: action.username }))
            .then(() => dispatch(actions.userChanged(action.username)));
          break;
      }
      return next(action);
    };
  };
}
