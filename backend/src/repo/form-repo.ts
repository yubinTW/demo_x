import * as TE from 'fp-ts/TaskEither'
import * as O from 'fp-ts/lib/Option'
import Form from '../models/form'
import { IForm } from '../types/form'


interface FormRepo {
    getForms(): TE.TaskEither<Error, O.Option<Readonly<Array<IForm>>>>
    addForm(body: IForm): TE.TaskEither<Error, Readonly<IForm>>
    getFormById(id: string): TE.TaskEither<Error, O.Option<Readonly<IForm>>>
}

class FormRepoImpl implements FormRepo {
    private static instance: FormRepoImpl
    private constructor() {
    }

    static of(): FormRepoImpl {
        return O.getOrElse(() => new FormRepoImpl())(O.fromNullable(FormRepoImpl.instance))
    }

    getForms(): TE.TaskEither<Error, O.Option<Readonly<Array<IForm>>>> {
        return TE.tryCatch(
            async () => {
                const resultArray: Array<IForm> = []

                for await (const k of Form.find()) {
                    resultArray.push(k);
                }
                return O.some(resultArray);
            },
            e => new Error(`Failed to get forms: ${e}`)
        )
    }

    /**
     * addForm :: IForm -> TE. Error Form
     * @param formBody - the form data
     * @throws error when creating a form
     */
    addForm(body: IForm): TE.TaskEither<Error, Readonly<IForm>> {
        return TE.tryCatch(
            () => Form.create(body),
            e => new Error(`Failed to create a form: ${e}`)
        )
    }

    // Option IFom :: None | Some IForm
    // https://gcanti.github.io/fp-ts/modules/Option.ts.html
    getFormById(id: string): TE.TaskEither<Error, O.Option<Readonly<IForm>>> {
        return TE.map<any, O.Option<Readonly<IForm>>>(f => f ? O.some(f) : O.none)(
            TE.tryCatch(
                () => Form.findById(id).exec(),
                e => new Error(`Failed to get form by id : ${e}`)
            )
        )
    }

}



const formOf: (reqBody: any) => Readonly<IForm> =
    (reqBody) => ({
        apiId: reqBody.apiId,
        subscriberId: reqBody.subscriberId,
        submitUser: reqBody.submitUser,
        status: reqBody.status,
        approver: reqBody.approver,
        approveDate: reqBody.approveDate,
        comment: reqBody.comment
    });


export { FormRepoImpl, formOf }