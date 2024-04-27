const express = require('express')
const router = express.Router()

const mongoose = require('mongoose')
const Pokemon = require('../models/pokemon')


router.get('/', (req, res, next) => {
    const page = parseInt(req.query.page) || 1 // 페이지 번호, 기본값은 1
    const region = req.query.region

    const type1 = req.query.types_1 || ''
    const type2 = req.query.types_2 || ''
    const perPage = 20 // 페이지당 아이템 수


    let query = { "dex.region": region} // 기본 쿼리
    if (type1 !== '' && type2 !== '') {
        query["base.types"] = { $all: [type1, type2] }; // 두 가지 타입 모두를 포함하는 조건 추가
    } else if (type1 !== '' || type2 !== '') {
        query["base.types"] = { $in: [type1, type2] }; // 두 가지 타입 중 하나를 포함하는 조건 추가
    }
    
    Pokemon
        .countDocuments() // 전체 문서 수를 가져옴
        .then(totalCount => {
            Pokemon
                .find(query)
                .skip((page - 1) * perPage) // 스킵할 아이템 수 계산
                .limit(perPage) // 한 페이지에 반환할 아이템 수 제한
                .exec()
                .then(docs => {
                    const totalPages = Math.ceil(totalCount / perPage) // 전체 페이지 수 계산
                    const response = {
                        total_count: totalCount, // 전체 아이템 수
                        total_pages: totalPages, // 전체 페이지 수
                        current_page: page, // 현재 페이지 번호
                        per_page: perPage, // 페이지당 아이템 수
                        pokemon: docs.map(doc => {
                            return {
                                _id : doc._id,
                                color : doc.color,
                                name : doc.name,
                                base_image : doc.base_image,
                                base_types : doc.base_types
                            }
                        })
                    };
                    res.status(200).json({
                        status : 200,
                        data : response,
                        message :  "정상적으로 포켓몬 정보를 조회했습니다."
                    })
                })
                .catch(err => {
                    res.status(500).json({
                        status : 500,
                        data : {},
                        message : "포켓몬 정보 요청이 실패했습니다."
                    })
                })
        })
        .catch(err => {
            res.status(500).json({
                status : 500,
                data : {},
                message : "포켓몬 정보 요청이 실패했습니다."
            })
        })
})

module.exports = router