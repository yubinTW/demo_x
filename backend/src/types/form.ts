enum Status {
    Pending = 'pending',
    Approved = 'approved',
    Rejected = 'rejected'
};

interface IForm {
    readonly _id?: string,
    apiId: string,
    subscriberId: string,
    submitUser: string,
    status: Status,
    approver: string,
    approveDate: Date,
    comment: string,
    readonly createdAt?: Date,
    readonly updatedAt?: Date
}

export { Status, IForm }