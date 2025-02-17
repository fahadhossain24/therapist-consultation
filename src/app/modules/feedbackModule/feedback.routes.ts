import express from 'express'
import feedbackControllers from './feedback.controllers'

const feedbackRouter = express.Router()

feedbackRouter.post('/create-or-update', feedbackControllers.createOrUpdateFeedback)
feedbackRouter.get('/retrive/therapist/:therapistId', feedbackControllers.getFeedbacksByTherapist)

export default feedbackRouter